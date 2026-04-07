import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ClaudeAdapter } from './claude.js';
import type { AdapterContext, AdapterStorage } from './types.js';

const mockStorage: AdapterStorage = {
  async readCheckpoint() { return null; },
  async writeCheckpoints() { return; },
};

const mockPricing = {
  async getModelPricing() {
    return {
      inputPerMillionUsd: 3.0,
      outputPerMillionUsd: 15.0,
      cacheReadPerMillionUsd: 0.3,
      cacheWritePerMillionUsd: 3.0,
      pricingSnapshotId: 'test',
      pricingSource: 'test',
      displayModel: 'claude-sonnet',
    };
  },
};

const mockContext: AdapterContext = {
  storage: mockStorage,
  pricing: mockPricing,
  clock: new Date(),
  paths: {},
  limits: { maxFilesPerPass: 10, maxBytesPerFile: 8 * 1024 * 1024 },
};

describe('ClaudeAdapter', () => {
  describe('discover', () => {
    it('returns empty sources when no Claude projects exist', async () => {
      const adapter = new ClaudeAdapter();
      const result = await adapter.discover({
        ...mockContext,
        paths: { claudeRoot: '/nonexistent/path' },
      });
      assert.strictEqual(result.sources.length, 0);
      assert.ok(result.warnings.includes('claude_source_not_found'));
    });
  });

  describe('healthCheck', () => {
    it('returns degraded when no sources found', async () => {
      const adapter = new ClaudeAdapter();
      const health = await adapter.healthCheck({
        ...mockContext,
        paths: { claudeRoot: '/nonexistent/path' },
      });
      assert.strictEqual(health.status, 'degraded');
      assert.strictEqual(health.sourcesFound, 0);
    });
  });

  describe('noise file exclusion', () => {
    it('excludes skill-injections.jsonl from discovery', async () => {
      const adapter = new ClaudeAdapter();
      const result = await adapter.discover({
        ...mockContext,
        paths: { claudeRoot: '/nonexistent/path' },
      });
      assert.strictEqual(result.warnings.filter(w => w.includes('skill-injections')).length, 0);
    });
  });
});

describe('ClaudeAdapter parsing', () => {
  it('parses a valid Claude JSONL record structure', async () => {
    const adapter = new ClaudeAdapter();
    
    const filePath = '/tmp/test.jsonl';
    const content = JSON.stringify({
      type: 'user',
      timestamp: '2026-04-05T10:00:00Z',
      message: { role: 'user', content: 'Hello' },
      cwd: '/test/project',
      session_id: 'test-session-123',
    }) + '\n' + JSON.stringify({
      type: 'assistant',
      timestamp: '2026-04-05T10:01:00Z',
      message: {
        role: 'assistant',
        content: 'Hi there',
        model: 'claude-sonnet-4-20250514',
        usage: { input_tokens: 100, output_tokens: 50 },
      },
      session_id: 'test-session-123',
    });

    const result = await adapter['parseFile'](filePath, content, mockContext);
    
    assert.strictEqual(result.sessions.length, 1);
    assert.strictEqual(result.sessions[0].provider, 'claude');
    assert.strictEqual(result.sessions[0].providerSessionId, 'test-session-123');
    assert.strictEqual(result.sessions[0].projectPath, '/test/project');
    assert.strictEqual(result.sessions[0].model, 'claude-sonnet-4-20250514');
    assert.strictEqual(result.sessions[0].tokens.input, 100);
    assert.strictEqual(result.sessions[0].tokens.output, 50);
  });

  it('rejects files with no user/assistant messages', async () => {
    const adapter = new ClaudeAdapter();
    
    const filePath = '/tmp/test.jsonl';
    const content = JSON.stringify({
      type: 'system',
      message: { role: 'system', content: 'System init' },
    });

    const result = await adapter['parseFile'](filePath, content, mockContext);
    
    assert.strictEqual(result.sessions.length, 0);
    assert.ok(result.warnings.some(w => w.includes('no_valid_conversation')));
  });

  it('derives model family correctly', async () => {
    const adapter = new ClaudeAdapter();
    
    const filePath = '/tmp/test.jsonl';
    const content = JSON.stringify({
      type: 'user',
      timestamp: '2026-04-05T10:00:00Z',
      message: { role: 'user', content: 'Hello' },
      session_id: 'test-session',
    }) + '\n' + JSON.stringify({
      type: 'assistant',
      timestamp: '2026-04-05T10:01:00Z',
      message: {
        role: 'assistant',
        content: 'Hi',
        model: 'claude-opus-4-20260219',
        usage: { input_tokens: 10, output_tokens: 5 },
      },
      session_id: 'test-session',
    });

    const result = await adapter['parseFile'](filePath, content, mockContext);
    
    assert.strictEqual(result.sessions[0].modelFamily, 'claude');
  });

  it('handles missing stats-cache.json gracefully', async () => {
    const adapter = new ClaudeAdapter();
    const discovery = await adapter.discover({
      ...mockContext,
      paths: { claudeRoot: '/nonexistent/path' },
    });
    assert.ok(discovery.warnings.includes('claude_source_not_found'));
  });
});