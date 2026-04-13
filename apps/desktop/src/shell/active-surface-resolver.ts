import type {
  ProviderId,
  ContextThresholdBand,
  ResolutionTier,
  ActiveSurfaceCapabilities,
  ActiveSurfaceResolution,
  WindowRegistryEntry,
  ActiveSurfaceSpan,
} from '@ttm/core';
import { DEFAULT_CAPABILITIES } from '@ttm/core';

export interface ActiveSurfaceResolverOptions {
  capabilities: ActiveSurfaceCapabilities;
  registry: Map<string, WindowRegistryEntry>;
}

export class ActiveSurfaceResolver {
  private capabilities: ActiveSurfaceCapabilities;
  private registry: Map<string, WindowRegistryEntry>;
  private currentSpan: ActiveSurfaceSpan | null = null;
  private lastResolution: ActiveSurfaceResolution | null = null;

  constructor(options: ActiveSurfaceResolverOptions) {
    this.capabilities = options.capabilities;
    this.registry = options.registry;
  }

  resolve(): ActiveSurfaceResolution {
    const activeWindowAvailable = this.capabilities.activeWindowDetection !== 'unavailable';
    const registryHasEntries = this.registry.size > 0;

    if (!activeWindowAvailable && !registryHasEntries) {
      return this.buildResolution(
        'tier_0_none',
        'none',
        null,
        null,
        null,
        'No active-window detection capability and no registry entries',
      );
    }

    if (!activeWindowAvailable && registryHasEntries) {
      const latestEntry = this.getLatestRegistryEntry();
      if (latestEntry) {
        return this.buildResolution(
          'tier_1_latest_session',
          'latest_session_fallback',
          latestEntry.key,
          latestEntry.providerSessionId,
          latestEntry.contextUsagePercent,
          'Latest session fallback - active-window detection unavailable',
        );
      }
    }

    if (activeWindowAvailable && registryHasEntries) {
      const activeEntry = this.getActiveRegistryEntry();
      if (activeEntry) {
        const tier = activeEntry.resolutionTier;
        return this.buildResolution(
          tier,
          tier === 'tier_2_provider_window' ? 'open_window_registry' : 'native_active_window',
          activeEntry.key,
          activeEntry.providerSessionId,
          activeEntry.contextUsagePercent,
          `Active surface resolved at ${tier}`,
        );
      }
    }

    return this.buildResolution(
      'tier_0_none',
      'none',
      null,
      null,
      null,
      'No trustworthy active surface target',
    );
  }

  getCapabilities(): ActiveSurfaceCapabilities {
    return { ...this.capabilities };
  }

  getRegistry(): Map<string, WindowRegistryEntry> {
    return new Map(this.registry);
  }

  getCurrentSpan(): ActiveSurfaceSpan | null {
    return this.currentSpan;
  }

  private buildResolution(
    tier: ResolutionTier,
    source: ActiveSurfaceResolution['source'],
    key: WindowRegistryEntry['key'] | null,
    providerSessionId: string | null,
    contextUsagePercent: number | null,
    reason: string,
  ): ActiveSurfaceResolution {
    const confidence = this.computeConfidence(tier);
    this.lastResolution = {
      key: key ?? null,
      provider: key?.provider ?? null,
      providerSessionId,
      resolutionTier: tier,
      confidence,
      reason,
      source,
    };
    return this.lastResolution;
  }

  private computeConfidence(tier: ResolutionTier): ActiveSurfaceResolution['confidence'] {
    switch (tier) {
      case 'tier_4_provider_window_plus_browser_or_explicit_session_truth':
        return 'high';
      case 'tier_3_provider_window_plus_candidate_session':
        return 'medium';
      case 'tier_2_provider_window':
        return 'medium';
      case 'tier_1_latest_session':
        return 'low';
      case 'tier_0_none':
        return 'none';
    }
  }

  private getLatestRegistryEntry(): WindowRegistryEntry | null {
    let latest: WindowRegistryEntry | null = null;
    for (const entry of this.registry.values()) {
      if (!latest || new Date(entry.lastSeenAt) > new Date(latest.lastSeenAt)) {
        latest = entry;
      }
    }
    return latest;
  }

  private getActiveRegistryEntry(): WindowRegistryEntry | null {
    for (const entry of this.registry.values()) {
      if (entry.isCurrentlyOpen) {
        return entry;
      }
    }
    return this.getLatestRegistryEntry();
  }
}
