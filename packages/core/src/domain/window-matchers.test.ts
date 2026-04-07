import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CodexMatcher, OpenCodeMatcher, findMatchingProvider } from './window-matchers.js';
import type { ExternalWindowSnapshot } from './window-context.js';

describe('CodexMatcher', () => {
  const matcher = new CodexMatcher();

  it('matches Codex app name', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-1',
      title: 'Codex - chat',
      appName: 'Codex',
      processId: 1234,
      processPath: '/Applications/Codex.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, 'codex');
    assert.strictEqual(result.confidence, 'medium');
  });

  it('matches Codex by process path', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-2',
      title: 'Test project',
      appName: '',
      processId: 1234,
      processPath: '/some/path/codex',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, 'codex');
    assert.notStrictEqual(result.confidence, 'none');
  });

  it('does NOT match OpenCode as Codex', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-3',
      title: 'OpenCode - chat',
      appName: 'OpenCode',
      processId: 5678,
      processPath: '/Applications/OpenCode.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, null);
    assert.strictEqual(result.confidence, 'none');
  });

  it('does NOT match unknown app', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-4',
      title: 'Some app',
      appName: 'Safari',
      processId: 9999,
      processPath: '/Applications/Safari.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, null);
    assert.strictEqual(result.confidence, 'none');
  });

  it('extracts session ID from title with UUID', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-5',
      title: 'Codex - 37ed2f5d-98b8-46ae-9cb1-e7870bafbb84',
      appName: 'Codex',
      processId: 1234,
      processPath: '/Applications/Codex.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, 'codex');
    assert.strictEqual(result.providerSessionId, '37ed2f5d-98b8-46ae-9cb1-e7870bafbb84');
    assert.strictEqual(result.confidence, 'high');
  });
});

describe('OpenCodeMatcher', () => {
  const matcher = new OpenCodeMatcher();

  it('matches OpenCode by app name', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-1',
      title: 'OpenCode - chat',
      appName: 'OpenCode',
      processId: 5678,
      processPath: '/Applications/OpenCode.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, 'opencode');
    assert.strictEqual(result.confidence, 'medium');
  });

  it('matches OpenCode by process path', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-2',
      title: 'Project',
      appName: '',
      processId: 5678,
      processPath: '/usr/local/bin/opencode',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, 'opencode');
    assert.notStrictEqual(result.confidence, 'none');
  });

  it('does NOT match Codex as OpenCode', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-3',
      title: 'Codex - chat',
      appName: 'Codex',
      processId: 1234,
      processPath: '/Applications/Codex.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = matcher.match(snapshot);
    assert.strictEqual(result.provider, null);
    assert.strictEqual(result.confidence, 'none');
  });
});

describe('findMatchingProvider', () => {
  it('returns Codex match for Codex window', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-1',
      title: 'Codex',
      appName: 'Codex',
      processId: 1234,
      processPath: '/Applications/Codex.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = findMatchingProvider(snapshot);
    assert.notStrictEqual(result, null);
    assert.strictEqual(result?.provider, 'codex');
  });

  it('returns OpenCode match for OpenCode window', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-2',
      title: 'OpenCode',
      appName: 'OpenCode',
      processId: 5678,
      processPath: '/Applications/OpenCode.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = findMatchingProvider(snapshot);
    assert.notStrictEqual(result, null);
    assert.strictEqual(result?.provider, 'opencode');
  });

  it('returns null for unknown window', () => {
    const snapshot: ExternalWindowSnapshot = {
      externalWindowId: 'window-3',
      title: 'Safari',
      appName: 'Safari',
      processId: 9999,
      processPath: '/Applications/Safari.app',
      bounds: null,
      detectedAt: new Date().toISOString(),
    };
    const result = findMatchingProvider(snapshot);
    assert.strictEqual(result, null);
  });
});