import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  tierLabel,
  tierDescription,
  canEmitChatSpecificNotification,
  canEmitProviderNotification,
  getNotificationDeliveryDecision,
  isFallbackState,
  isStrongTruth,
  TIER_STRENGTH,
  DEFAULT_CAPABILITIES,
  cleanupStaleRegistry,
} from './active-surface.js';
import type { ResolutionTier, ActiveSurfaceCapabilities, WindowRegistryEntry } from './active-surface.js';

describe('tierLabel', () => {
  it('returns human-readable tier names', () => {
    assert.strictEqual(tierLabel('tier_0_none'), 'No active window detected');
    assert.strictEqual(tierLabel('tier_1_latest_session'), 'Latest session (fallback)');
    assert.strictEqual(tierLabel('tier_2_provider_window'), 'Provider window detected');
  });
});

describe('tierDescription', () => {
  it('returns descriptive explanation for each tier', () => {
    const desc = tierDescription('tier_1_latest_session');
    assert.ok(desc.includes('fallback'));
    assert.ok(desc.toLowerCase().includes('not the active window'));
  });
});

describe('canEmitChatSpecificNotification', () => {
  it('returns false for tier 0 and 1', () => {
    assert.strictEqual(canEmitChatSpecificNotification('tier_0_none'), false);
    assert.strictEqual(canEmitChatSpecificNotification('tier_1_latest_session'), false);
  });

  it('returns false for tier 2', () => {
    assert.strictEqual(canEmitChatSpecificNotification('tier_2_provider_window'), false);
  });

  it('returns true for tier 3 and 4', () => {
    assert.strictEqual(canEmitChatSpecificNotification('tier_3_provider_window_plus_candidate_session'), true);
    assert.strictEqual(canEmitChatSpecificNotification('tier_4_provider_window_plus_browser_or_explicit_session_truth'), true);
  });
});

describe('canEmitProviderNotification', () => {
  it('returns false for tier 0 and 1', () => {
    assert.strictEqual(canEmitProviderNotification('tier_0_none'), false);
    assert.strictEqual(canEmitProviderNotification('tier_1_latest_session'), false);
  });

  it('returns true for tier 2+', () => {
    assert.strictEqual(canEmitProviderNotification('tier_2_provider_window'), true);
    assert.strictEqual(canEmitProviderNotification('tier_3_provider_window_plus_candidate_session'), true);
  });
});

describe('getNotificationDeliveryDecision', () => {
  const availableCaps: ActiveSurfaceCapabilities = {
    ...DEFAULT_CAPABILITIES,
    desktopNotifications: 'available',
  };

  const unavailableCaps: ActiveSurfaceCapabilities = {
    ...DEFAULT_CAPABILITIES,
    desktopNotifications: 'unavailable',
  };

  it('blocks notifications for tier 0', () => {
    const result = getNotificationDeliveryDecision('tier_0_none', availableCaps, false, 'warning_75');
    assert.strictEqual(result.gateClosed, true);
    assert.strictEqual(result.delivery, 'ambient_only');
  });

  it('blocks chat notifications for tier 1 (latest-session fallback)', () => {
    const result = getNotificationDeliveryDecision('tier_1_latest_session', availableCaps, true, 'warning_90');
    assert.strictEqual(result.gateClosed, true);
    assert.strictEqual(result.reason, 'Latest-session fallback - chat notifications disabled');
  });

  it('allows ambient for tier 2 foreground', () => {
    const result = getNotificationDeliveryDecision('tier_2_provider_window', unavailableCaps, false, 'warning_75');
    assert.strictEqual(result.gateClosed, false);
    assert.strictEqual(result.delivery, 'ambient_only');
  });

  it('allows desktop for tier 3+ background at warning_75', () => {
    const result = getNotificationDeliveryDecision('tier_3_provider_window_plus_candidate_session', availableCaps, true, 'warning_75');
    assert.strictEqual(result.delivery, 'desktop_notification');
  });

  it('delivers desktop at warning_85 for strong tier', () => {
    const result = getNotificationDeliveryDecision('tier_4_provider_window_plus_browser_or_explicit_session_truth', availableCaps, false, 'warning_85');
    assert.strictEqual(result.delivery, 'desktop_notification');
  });

  it('falls back to in-app when desktop unavailable at high threshold', () => {
    const result = getNotificationDeliveryDecision('tier_4_provider_window_plus_browser_or_explicit_session_truth', unavailableCaps, false, 'warning_90');
    assert.strictEqual(result.delivery, 'in_app_banner');
    assert.strictEqual(result.reason, 'Desktop notifications unavailable - in-app banner');
  });
});

describe('isFallbackState', () => {
  it('returns true for tier 0 and 1', () => {
    assert.strictEqual(isFallbackState('tier_0_none'), true);
    assert.strictEqual(isFallbackState('tier_1_latest_session'), true);
  });

  it('returns false for tier 2+', () => {
    assert.strictEqual(isFallbackState('tier_2_provider_window'), false);
  });
});

describe('isStrongTruth', () => {
  it('returns true for tier 3 and 4', () => {
    assert.strictEqual(isStrongTruth('tier_3_provider_window_plus_candidate_session'), true);
    assert.strictEqual(isStrongTruth('tier_4_provider_window_plus_browser_or_explicit_session_truth'), true);
  });

  it('returns false for tier 0-2', () => {
    assert.strictEqual(isStrongTruth('tier_0_none'), false);
    assert.strictEqual(isStrongTruth('tier_1_latest_session'), false);
    assert.strictEqual(isStrongTruth('tier_2_provider_window'), false);
  });
});

describe('cleanupStaleRegistry', () => {
  it('removes entries older than maxAgeMs', () => {
    const now = new Date().toISOString();
    const old = new Date(Date.now() - 40000).toISOString();
    
    const registry = new Map<string, WindowRegistryEntry>([
      ['codex:1', { key: { provider: 'codex', externalWindowId: '1' }, title: 'test', appName: 'Codex', processPath: '/test', lastSeenAt: now, isCurrentlyOpen: true, resolutionTier: 'tier_2_provider_window', providerSessionId: null, contextUsagePercent: null, thresholdBand: 'normal', highestNotifiedBand: null }],
      ['codex:2', { key: { provider: 'codex', externalWindowId: '2' }, title: 'old', appName: 'Codex', processPath: '/test', lastSeenAt: old, isCurrentlyOpen: false, resolutionTier: 'tier_2_provider_window', providerSessionId: null, contextUsagePercent: null, thresholdBand: 'normal', highestNotifiedBand: null }],
    ]);

    const cleaned = cleanupStaleRegistry(registry, 30000);
    assert.strictEqual(cleaned.size, 1);
    assert.ok(cleaned.has('codex:1'));
  });
});