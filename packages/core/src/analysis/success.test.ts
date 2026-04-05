import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSuccess } from './success.js';
import type { CanonicalSessionSeed, SessionOutcome, SessionMetadata } from '../domain/session.js';

function baseMetadata(overrides: Partial<SessionMetadata['providerMetadata']> = {}): SessionMetadata['providerMetadata'] {
  return { taskCompletedCount: 1, taskStartedCount: 1, ...overrides };
}

function makeSeed(outcome: SessionOutcome, pmOverrides: Partial<SessionMetadata['providerMetadata']> = {}, otherOverrides: Partial<CanonicalSessionSeed> = {}): CanonicalSessionSeed {
  const metadata: SessionMetadata = {
    parserVersion: '1.0',
    parserWarnings: [],
    containsSensitiveText: false,
    providerMetadata: baseMetadata(pmOverrides),
  };

  const base: CanonicalSessionSeed = {
    provider: 'codex',
    providerSessionId: 'sess-001',
    sourcePath: '/tmp/test.jsonl',
    projectPath: '/tmp/project',
    startedAt: '2026-04-01T10:00:00Z',
    endedAt: '2026-04-01T10:30:00Z',
    lastActivityAt: '2026-04-01T10:30:00Z',
    durationMs: 1_800_000,
    model: 'gpt-5',
    modelFamily: 'gpt',
    title: 'Test session',
    messageCount: 10,
    toolCallCount: 20,
    tokens: { input: 5000, output: 3000, cachedInput: 2000, cachedWrite: 0, reasoning: 1000, total: 11000 },
    costs: { inputUsd: 0.5, outputUsd: 0.3, cacheReadUsd: 0.1, cacheWriteUsd: 0, totalUsd: 0.9, pricingSnapshotId: 'snap-1' },
    cache: { hitRate: 0.4, cacheEligibleTokens: 7000 },
    metadata,
    resetWindow: null,
  };

  return { ...base, ...otherOverrides };
}

describe('analyzeSuccess', () => {
  describe('verified success + low rework', () => {
    it('returns verified verification state when verification command passed', () => {
      const seed = makeSeed('success', { verificationPassed: true });
      const result = analyzeSuccess(seed, 'success');
      assert.strictEqual(result.verificationState, 'verified');
      assert.ok(result.successScore !== null && result.successScore > 50);
      assert.ok(result.analysisConfidence !== null && result.analysisConfidence > 0.3);
    });
  });

  describe('probable success + missing verification', () => {
    it('returns probable when repo change detected but no verification command', () => {
      const seed = makeSeed('success', { gitFilesChanged: 3 });
      const result = analyzeSuccess(seed, 'success');
      assert.strictEqual(result.verificationState, 'probable');
      assert.ok(result.successScore !== null);
    });
  });

  describe('contradicted / revert-like outcome', () => {
    it('returns contradicted when revert indicator present', () => {
      const seed = makeSeed('reverted', { taskCompletedCount: 0 });
      const result = analyzeSuccess(seed, 'reverted');
      assert.strictEqual(result.completionState, 'reverted');
      assert.strictEqual(result.verificationState, 'contradicted');
    });
  });

  describe('abandoned session', () => {
    it('returns abandoned completion state', () => {
      const seed = makeSeed('abandoned', { taskCompletedCount: 0 }, { messageCount: 2 });
      const result = analyzeSuccess(seed, 'abandoned');
      assert.strictEqual(result.completionState, 'abandoned');
    });
  });

  describe('high-cost low-progress session', () => {
    it('produces low value density for expensive sessions', () => {
      const seed = makeSeed('partial', { taskCompletedCount: 0, taskStartedCount: 5 }, {
        tokens: { input: 50000, output: 30000, cachedInput: 0, cachedWrite: 0, reasoning: 10000, total: 90000 },
        costs: { inputUsd: 5.0, outputUsd: 3.0, cacheReadUsd: 0, cacheWriteUsd: 0, totalUsd: 8.0, pricingSnapshotId: 'snap-1' },
        durationMs: 7200000,
        metadata: {
          parserVersion: '1.0',
          parserWarnings: ['error in tool call', 'fail to parse', 'exception caught', 'error retry'],
          containsSensitiveText: false,
          providerMetadata: { taskCompletedCount: 0, taskStartedCount: 5 },
        },
      });
      const result = analyzeSuccess(seed, 'partial');
      assert.ok(result.valueDensityScore !== null);
      assert.ok(result.valueDensityScore < 50, `valueDensityScore should be low for expensive session, got ${result.valueDensityScore}`);
    });
  });

  describe('no repo present', () => {
    it('returns missing verification when no project path', () => {
      const seed = makeSeed('success', {}, { projectPath: null });
      const result = analyzeSuccess(seed, 'success');
      assert.strictEqual(result.verificationState, 'missing');
    });
  });

  describe('repo present but no diff', () => {
    it('does not produce repo_change signal when no changes', () => {
      const seed = makeSeed('success');
      const result = analyzeSuccess(seed, 'success');
      const hasRepoChange = result.successSignals.some(s => s.kind === 'repo_change');
      assert.strictEqual(hasRepoChange, false);
      assert.strictEqual(result.verificationState, 'missing');
    });
  });

  describe('repo diff detected', () => {
    it('produces repo_change signal with positive direction', () => {
      const seed = makeSeed('success', { gitDiffLines: 150, gitFilesChanged: 5 });
      const result = analyzeSuccess(seed, 'success');
      const repoSignal = result.successSignals.find(s => s.kind === 'repo_change');
      assert.ok(repoSignal !== undefined);
      assert.strictEqual(repoSignal?.direction, 'positive');
      assert.strictEqual(result.verificationState, 'probable');
    });
  });

  describe('verification evidence detected', () => {
    it('produces verification_command signal when tests pass', () => {
      const seed = makeSeed('success', { testResults: JSON.stringify({ passed: 42, failed: 0 }) });
      const result = analyzeSuccess(seed, 'success');
      const verifSignal = result.successSignals.find(s => s.kind === 'verification_command');
      assert.ok(verifSignal !== undefined);
      assert.strictEqual(verifSignal?.direction, 'positive');
      assert.strictEqual(result.verificationState, 'verified');
    });

    it('produces negative verification signal when tests fail', () => {
      const seed = makeSeed('success', { testResults: JSON.stringify({ passed: 38, failed: 4 }) });
      const result = analyzeSuccess(seed, 'success');
      const verifSignal = result.successSignals.find(s => s.kind === 'verification_command');
      assert.ok(verifSignal !== undefined);
      assert.strictEqual(verifSignal?.direction, 'negative');
    });

    it('produces verification signal when build succeeds', () => {
      const seed = makeSeed('success', { buildSucceeded: true });
      const result = analyzeSuccess(seed, 'success');
      const verifSignal = result.successSignals.find(s => s.kind === 'verification_command');
      assert.ok(verifSignal !== undefined);
      assert.strictEqual(verifSignal?.direction, 'positive');
      assert.strictEqual(result.verificationState, 'verified');
    });
  });

  describe('contradictory evidence lowers confidence', () => {
    it('lowers confidence when both positive and negative signals exist', () => {
      const seed = makeSeed('partial', { taskCompletedCount: 1, taskStartedCount: 4 }, {
        metadata: {
          parserVersion: '1.0',
          parserWarnings: ['error in tool call', 'fail to parse', 'exception caught'],
          containsSensitiveText: false,
          providerMetadata: { taskCompletedCount: 1, taskStartedCount: 4 },
        },
      });
      const result = analyzeSuccess(seed, 'partial');
      assert.ok(result.analysisConfidence !== null);
      assert.ok(result.analysisConfidence < 0.6, `confidence should be lowered with contradictions, got ${result.analysisConfidence}`);
    });
  });
});
