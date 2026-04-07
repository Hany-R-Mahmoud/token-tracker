import type { ProviderId, ContextThresholdBand, ProviderWindowKey } from './window-context.js';

export type CapabilityState = 'available' | 'degraded' | 'unavailable';

export interface ActiveSurfaceCapabilities {
  activeWindowDetection: CapabilityState;
  openWindowRegistry: CapabilityState;
  browserUrlEnrichment: CapabilityState;
  browserNativeMessaging: CapabilityState;
  desktopNotifications: CapabilityState;
  attentionRequest: CapabilityState;
}

export const DEFAULT_CAPABILITIES: ActiveSurfaceCapabilities = {
  activeWindowDetection: 'unavailable',
  openWindowRegistry: 'unavailable',
  browserUrlEnrichment: 'unavailable',
  browserNativeMessaging: 'unavailable',
  desktopNotifications: 'unavailable',
  attentionRequest: 'unavailable',
};

export type ResolutionTier =
  | 'tier_0_none'
  | 'tier_1_latest_session'
  | 'tier_2_provider_window'
  | 'tier_3_provider_window_plus_candidate_session'
  | 'tier_4_provider_window_plus_browser_or_explicit_session_truth';

export type ActiveSurfaceSource =
  | 'native_active_window'
  | 'open_window_registry'
  | 'browser_url'
  | 'provider_activity_correlation'
  | 'latest_session_fallback'
  | 'native_macos_apple_script'
  | 'none';

export type ActiveSurfaceConfidence = 'high' | 'medium' | 'low' | 'none';

export interface ActiveSurfaceResolution {
  key: ProviderWindowKey | null;
  provider: ProviderId | null;
  providerSessionId: string | null;
  resolutionTier: ResolutionTier;
  confidence: ActiveSurfaceConfidence;
  reason: string;
  source: ActiveSurfaceSource;
}

export interface WindowRegistryEntry {
  key: ProviderWindowKey;
  title: string | null;
  appName: string | null;
  processPath: string | null;
  lastSeenAt: string;
  isCurrentlyOpen: boolean;
  resolutionTier: ResolutionTier;
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  thresholdBand: ContextThresholdBand;
  highestNotifiedBand: 'warning_75' | 'warning_85' | 'warning_90' | null;
}

export interface ActiveSurfaceSpan {
  key: ProviderWindowKey | null;
  startedAt: string;
  endedAt: string | null;
  resolutionTier: ResolutionTier;
  reason: string;
}

export interface NotificationDeliveryDecision {
  delivery: 'ambient_only' | 'in_app_banner' | 'desktop_notification';
  reason: string;
  gateClosed: boolean;
}

export const TIER_STRENGTH: Record<ResolutionTier, number> = {
  tier_0_none: 0,
  tier_1_latest_session: 1,
  tier_2_provider_window: 2,
  tier_3_provider_window_plus_candidate_session: 3,
  tier_4_provider_window_plus_browser_or_explicit_session_truth: 4,
};

export function tierLabel(tier: ResolutionTier): string {
  switch (tier) {
    case 'tier_0_none': return 'No active window detected';
    case 'tier_1_latest_session': return 'Latest session (fallback)';
    case 'tier_2_provider_window': return 'Provider window detected';
    case 'tier_3_provider_window_plus_candidate_session': return 'Window + probable session';
    case 'tier_4_provider_window_plus_browser_or_explicit_session_truth': return 'Full resolution';
  }
}

export function tierDescription(tier: ResolutionTier): string {
  switch (tier) {
    case 'tier_0_none':
      return 'No active provider window could be detected. Check platform support.';
    case 'tier_1_latest_session':
      return 'Showing data from the most recent session as fallback. Not the active window.';
    case 'tier_2_provider_window':
      return 'Active provider window detected, but specific session is unknown.';
    case 'tier_3_provider_window_plus_candidate_session':
      return 'Window and probable session identified. Some uncertainty remains.';
    case 'tier_4_provider_window_plus_browser_or_explicit_session_truth':
      return 'Strongest available resolution with explicit session match.';
  }
}

export function canEmitChatSpecificNotification(tier: ResolutionTier): boolean {
  return TIER_STRENGTH[tier] >= TIER_STRENGTH.tier_3_provider_window_plus_candidate_session;
}

export function canEmitProviderNotification(tier: ResolutionTier): boolean {
  return TIER_STRENGTH[tier] >= TIER_STRENGTH.tier_2_provider_window;
}

export function getNotificationDeliveryDecision(
  tier: ResolutionTier,
  capabilities: ActiveSurfaceCapabilities,
  targetIsBackground: boolean,
  thresholdBand: ContextThresholdBand,
): NotificationDeliveryDecision {
  const tierStrength = TIER_STRENGTH[tier];
  const desktopAvailable = capabilities.desktopNotifications === 'available';
  
  if (tierStrength === 0) {
    return {
      delivery: 'ambient_only',
      reason: 'No active window - notifications disabled',
      gateClosed: true,
    };
  }

  if (tierStrength === 1) {
    return {
      delivery: 'ambient_only',
      reason: 'Latest-session fallback - chat notifications disabled',
      gateClosed: true,
    };
  }

  if (tierStrength < 3) {
    return {
      delivery: targetIsBackground && desktopAvailable ? 'desktop_notification' : 'ambient_only',
      reason: 'Provider-window only - limited notifications',
      gateClosed: false,
    };
  }

  if (thresholdBand === 'normal' || thresholdBand === 'unknown') {
    return {
      delivery: 'ambient_only',
      reason: 'No threshold crossing',
      gateClosed: true,
    };
  }

  if (thresholdBand === 'warning_75' && !targetIsBackground) {
    return {
      delivery: 'ambient_only',
      reason: 'Warning 75% - ambient only for foreground window',
      gateClosed: false,
    };
  }

  if (thresholdBand === 'warning_75' && targetIsBackground && desktopAvailable) {
    return {
      delivery: 'desktop_notification',
      reason: 'Warning 75% + background + available',
      gateClosed: false,
    };
  }

  if (thresholdBand === 'warning_85' || thresholdBand === 'warning_90') {
    if (desktopAvailable) {
      return {
        delivery: 'desktop_notification',
        reason: `Warning ${thresholdBand.split('_')[1]}% - notification delivered`,
        gateClosed: false,
      };
    }
    return {
      delivery: 'in_app_banner',
      reason: 'Desktop notifications unavailable - in-app banner',
      gateClosed: false,
    };
  }

  return {
    delivery: 'ambient_only',
    reason: 'Default - ambient only',
    gateClosed: false,
  };
}

export function mergeWithRegistry(
  registry: Map<string, WindowRegistryEntry>,
  newEntry: WindowRegistryEntry,
): Map<string, WindowRegistryEntry> {
  const key = `${newEntry.key.provider}:${newEntry.key.externalWindowId}`;
  const updated = new Map(registry);
  updated.set(key, newEntry);
  return updated;
}

export function cleanupStaleRegistry(
  registry: Map<string, WindowRegistryEntry>,
  maxAgeMs: number,
): Map<string, WindowRegistryEntry> {
  const now = Date.now();
  const cleaned = new Map<string, WindowRegistryEntry>();
  
  for (const [key, entry] of registry.entries()) {
    const lastSeenMs = new Date(entry.lastSeenAt).getTime();
    if (now - lastSeenMs < maxAgeMs) {
      cleaned.set(key, entry);
    }
  }
  
  return cleaned;
}

export function isFallbackState(tier: ResolutionTier): boolean {
  return tier === 'tier_0_none' || tier === 'tier_1_latest_session';
}

export function isStrongTruth(tier: ResolutionTier): boolean {
  return TIER_STRENGTH[tier] >= TIER_STRENGTH.tier_3_provider_window_plus_candidate_session;
}
