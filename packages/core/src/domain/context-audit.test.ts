import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditSessionContext, getContextPressureColor, getContextPressureLabel } from './context-audit.js';

describe('auditSessionContext', () => {
  describe('context pressure derivation', () => {
    it('returns low pressure when usage < 40%', () => {
      const result = auditSessionContext(10000, 5000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'low');
      assert.ok(result.contextUsagePercent !== null && result.contextUsagePercent < 40);
    });

    it('returns medium pressure when usage 40-70%', () => {
      const result = auditSessionContext(40000, 20000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'medium');
    });

    it('returns high pressure when usage 70-90%', () => {
      const result = auditSessionContext(80000, 30000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'high');
    });

    it('returns critical pressure when usage >= 90%', () => {
      const result = auditSessionContext(100000, 50000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'critical');
    });

    it('returns unknown when model is null', () => {
      const result = auditSessionContext(10000, 5000, 0, 0, 0, null, 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'unknown');
    });
  });

  describe('context breakdown derivation', () => {
    it('calculates breakdown percentages correctly', () => {
      const result = auditSessionContext(50000, 30000, 10000, 5000, 5000, 'claude-3-5-sonnet-20241022', 10, null, null, null, null);
      assert.ok(result.contextBreakdown.length > 0);
      const total = result.contextBreakdown.reduce((sum, b) => sum + b.tokens, 0);
      assert.strictEqual(result.inputTokens + result.outputTokens + result.reasoningTokens + result.cacheReadTokens + result.cacheWriteTokens, total);
    });
  });

  describe('context warnings', () => {
    it('warns about high tool call count', () => {
      const result = auditSessionContext(10000, 5000, 0, 0, 0, 'gpt-4o', 60, null, null, null, null);
      assert.ok(result.contextWarnings.some(w => w.includes('tool call count')));
    });

    it('warns about high context spend with low success', () => {
      const result = auditSessionContext(80000, 30000, 10000, 0, 0, 'gpt-4o', 10, null, null, 20, null);
      assert.ok(result.contextWarnings.some(w => w.includes('low success')));
    });

    it('warns about near context limit', () => {
      const result = auditSessionContext(100000, 40000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextPressureState, 'critical');
      assert.ok(result.contextWarnings.some(w => w.includes('limit')));
    });
  });

  describe('Phase 009 bridge', () => {
    it('accepts successScore and valueDensityScore parameters', () => {
      const result = auditSessionContext(10000, 5000, 0, 0, 0, 'gpt-4o', 10, null, null, 85, 70);
      assert.strictEqual(result.contextWarnings.length, 0);
    });

    it('generates warning for low value density with high tokens', () => {
      const result = auditSessionContext(80000, 30000, 10000, 0, 0, 'gpt-4o', 10, null, null, null, 20);
      assert.ok(result.contextWarnings.some(w => w.includes('value density')));
    });
  });

  describe('model context limits', () => {
    it('uses correct limit for claude-3-5-sonnet', () => {
      const result = auditSessionContext(100000, 50000, 0, 0, 0, 'claude-3-5-sonnet-20241022', 10, null, null, null, null);
      assert.strictEqual(result.contextLimit, 200000);
      assert.strictEqual(result.hasContextLimit, true);
    });

    it('uses correct limit for gpt-4o', () => {
      const result = auditSessionContext(60000, 30000, 0, 0, 0, 'gpt-4o', 10, null, null, null, null);
      assert.strictEqual(result.contextLimit, 128000);
    });

    it('falls back to default for unknown models', () => {
      const result = auditSessionContext(10000, 5000, 0, 0, 0, 'unknown-model-xyz', 10, null, null, null, null);
      assert.strictEqual(result.contextLimit, 128000);
    });
  });
});

describe('getContextPressureColor', () => {
  it('returns correct colors for each state', () => {
    assert.ok(getContextPressureColor('critical').includes('critical'));
    assert.ok(getContextPressureColor('high').includes('warning'));
    assert.ok(getContextPressureColor('medium').includes('accent'));
    assert.ok(getContextPressureColor('low').includes('success'));
    assert.ok(getContextPressureColor('unknown').includes('text-muted'));
  });
});

describe('getContextPressureLabel', () => {
  it('returns capitalized labels', () => {
    assert.strictEqual(getContextPressureLabel('low'), 'Low');
    assert.strictEqual(getContextPressureLabel('critical'), 'Critical');
    assert.strictEqual(getContextPressureLabel('unknown'), 'Unknown');
  });
});