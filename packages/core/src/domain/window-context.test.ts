import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveThresholdBand,
  bandToColor,
  bandLabel,
  shouldFireNotification,
  updateCheckpoint,
  resetCheckpointForBand,
  THRESHOLD_ORDER,
} from './window-context.js';
import type { ContextThresholdBand, NotificationCheckpoint, NotificationEvent, ProviderId, ProviderWindowKey } from './window-context.js';

describe('deriveThresholdBand', () => {
  it('returns normal for null', () => {
    assert.strictEqual(deriveThresholdBand(null), 'unknown');
  });

  it('returns normal for below 75%', () => {
    assert.strictEqual(deriveThresholdBand(50), 'normal');
    assert.strictEqual(deriveThresholdBand(74.9), 'normal');
  });

  it('returns warning_75 for 75-85%', () => {
    assert.strictEqual(deriveThresholdBand(75), 'warning_75');
    assert.strictEqual(deriveThresholdBand(84.9), 'warning_75');
  });

  it('returns warning_85 for 85-90%', () => {
    assert.strictEqual(deriveThresholdBand(85), 'warning_85');
    assert.strictEqual(deriveThresholdBand(89.9), 'warning_85');
  });

  it('returns warning_90 for 90%+', () => {
    assert.strictEqual(deriveThresholdBand(90), 'warning_90');
    assert.strictEqual(deriveThresholdBand(100), 'warning_90');
  });
});

describe('bandToColor', () => {
  it('maps threshold bands to colors correctly', () => {
    assert.strictEqual(bandToColor('normal'), 'green');
    assert.strictEqual(bandToColor('warning_75'), 'yellow');
    assert.strictEqual(bandToColor('warning_85'), 'yellow');
    assert.strictEqual(bandToColor('warning_90'), 'red');
    assert.strictEqual(bandToColor('unknown'), 'neutral');
  });
});

describe('bandLabel', () => {
  it('returns human-readable labels', () => {
    assert.strictEqual(bandLabel('normal'), 'Normal');
    assert.strictEqual(bandLabel('warning_75'), 'Caution (≥75%)');
    assert.strictEqual(bandLabel('warning_85'), 'Warning (≥85%)');
    assert.strictEqual(bandLabel('warning_90'), 'Critical (≥90%)');
    assert.strictEqual(bandLabel('unknown'), 'Unknown');
  });
});

describe('shouldFireNotification', () => {
  const makeCheckpoint = (band: string | null): NotificationCheckpoint | null => {
    if (!band) return null;
    return {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      highestNotifiedBand: band as 'warning_75' | 'warning_85' | 'warning_90',
      lastNotifiedAt: new Date().toISOString(),
    };
  };

  it('does not fire for normal band', () => {
    const result = shouldFireNotification('normal', makeCheckpoint(null));
    assert.strictEqual(result, null);
  });

  it('does not fire for unknown band', () => {
    const result = shouldFireNotification('unknown', makeCheckpoint(null));
    assert.strictEqual(result, null);
  });

  it('does not fire when no checkpoint exists (requires known window)', () => {
    const result = shouldFireNotification('warning_75', null);
    assert.strictEqual(result, null);
  });

  it('does not fire again at same threshold', () => {
    const result = shouldFireNotification('warning_75', makeCheckpoint('warning_75'));
    assert.strictEqual(result, null);
  });

  it('fires when crossing to higher threshold', () => {
    const result = shouldFireNotification('warning_85', makeCheckpoint('warning_75'));
    assert.notStrictEqual(result, null);
    assert.strictEqual(result?.band, 'warning_85');
  });

  it('fires when crossing to critical', () => {
    const result = shouldFireNotification('warning_90', makeCheckpoint('warning_85'));
    assert.notStrictEqual(result, null);
    assert.strictEqual(result?.band, 'warning_90');
  });
});

describe('updateCheckpoint', () => {
  it('updates checkpoint with new event', () => {
    const event: NotificationEvent = {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      band: 'warning_75',
      providerSessionId: null,
      contextUsagePercent: 80,
      triggeredAt: new Date().toISOString(),
    };
    const checkpoint = updateCheckpoint(null, event);
    assert.strictEqual(checkpoint?.highestNotifiedBand, 'warning_75');
    assert.strictEqual(checkpoint?.lastNotifiedAt, event.triggeredAt);
  });

  it('returns same checkpoint when event is null', () => {
    const existing: NotificationCheckpoint = {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      highestNotifiedBand: 'warning_75',
      lastNotifiedAt: new Date().toISOString(),
    };
    const result = updateCheckpoint(existing, null);
    assert.strictEqual(result, existing);
  });
});

describe('resetCheckpointForBand', () => {
  it('resets when usage drops below notified threshold', () => {
    const checkpoint: NotificationCheckpoint = {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      highestNotifiedBand: 'warning_85',
      lastNotifiedAt: new Date().toISOString(),
    };
    const result = resetCheckpointForBand(checkpoint, 'warning_75');
    assert.strictEqual(result?.highestNotifiedBand, 'warning_75');
  });

  it('returns null when usage drops to normal', () => {
    const checkpoint: NotificationCheckpoint = {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      highestNotifiedBand: 'warning_75',
      lastNotifiedAt: new Date().toISOString(),
    };
    const result = resetCheckpointForBand(checkpoint, 'normal');
    assert.strictEqual(result, null);
  });

  it('keeps checkpoint when still in same or higher band', () => {
    const checkpoint: NotificationCheckpoint = {
      key: { provider: 'codex' as ProviderId, externalWindowId: 'window-1' },
      highestNotifiedBand: 'warning_75',
      lastNotifiedAt: new Date().toISOString(),
    };
    const result = resetCheckpointForBand(checkpoint, 'warning_85');
    assert.strictEqual(result, checkpoint);
  });
});