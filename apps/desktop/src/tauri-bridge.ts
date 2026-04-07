import { execSync } from 'node:child_process';
import type { 
  ExternalWindowSnapshot, 
  ActiveSurfaceCapabilities, 
  ActiveSurfaceResolution as CoreActiveSurfaceResolution, 
  WindowRegistryEntry, 
  ProviderId 
} from '@ttm/core';
import { DEFAULT_CAPABILITIES } from '@ttm/core';

export interface ActiveSurfaceState {
  resolution: CoreActiveSurfaceResolution | null;
  capabilities: ActiveSurfaceCapabilities;
  windows: ExternalWindowSnapshot[];
  isNative: boolean;
  isAvailable: boolean;
  lastUpdated: string;
}

const SUPPORTED_PROVIDERS = new Set(['codex', 'opencode', 'claude', 'cursor']);

export interface NativeBridgeQueryResult {
  activeWindow: ExternalWindowSnapshot | null;
  openWindows: ExternalWindowSnapshot[];
  capabilities: ActiveSurfaceCapabilities;
  resolution: CoreActiveSurfaceResolution;
  source: string;
  nativeSuccess: boolean;
}

export interface NativeBridgeScriptRunners {
  runActiveWindowScript?: () => ExternalWindowSnapshot | null;
  runOpenWindowsScript?: () => ExternalWindowSnapshot[];
}

export function isSupportedProvider(provider: string | null): boolean {
  if (!provider) return false;
  return SUPPORTED_PROVIDERS.has(provider.toLowerCase());
}

export function mapProviderToId(appName: string | null): ProviderId | null {
  if (!appName) return null;
  const lower = appName.toLowerCase();
  if (lower.includes('codex')) return 'codex';
  if (lower.includes('opencode') || lower.includes('open code')) return 'opencode';
  if (lower.includes('claude')) return 'claude';
  if (lower.includes('cursor')) return 'cursor';
  return null;
}

export function generateWindowId(appName: string, index: number): string {
  const sanitizedApp = appName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `native-${sanitizedApp}-${index}`;
}

function normalizePipePart(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseActiveWindowOutput(output: string): ExternalWindowSnapshot | null {
  const lines = output.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return null;
  
  const parts = lines[0].split('|');
  if (parts.length < 2) return null;
  
  const appName = parts[0].trim();
  const processPath = normalizePipePart(parts[1]);
  const title = normalizePipePart(parts[2]) === 'no title' ? null : normalizePipePart(parts[2]);
  
  return {
    externalWindowId: generateWindowId(appName, 0),
    title,
    appName,
    processId: null,
    processPath,
    bounds: null,
    detectedAt: new Date().toISOString(),
  };
}

export function parseOpenWindowsOutput(output: string): ExternalWindowSnapshot[] {
  const windows: ExternalWindowSnapshot[] = [];
  const entries = output.trim().split('||').filter(e => e.trim());
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const parts = entry.split('|');
    if (parts.length < 2) continue;
    
    const appName = parts[0].trim();
    const processPath = normalizePipePart(parts[1]);
    const title = normalizePipePart(parts[2]) === 'no title' ? null : normalizePipePart(parts[2]);
    
    if (appName) {
      windows.push({
        externalWindowId: generateWindowId(appName, i),
        title,
        appName,
        processId: null,
        processPath,
        bounds: null,
        detectedAt: new Date().toISOString(),
      });
    }
  }
  
  return windows;
}

export function buildActiveWindowScript(): string {
  return `osascript -e '
    tell application "System Events"
      set frontApp to first application process whose frontmost is true
      set appName to name of frontApp
      set appPath to ""
      try
        set winCount to count of windows of frontApp
        if winCount > 0 then
          set winTitle to name of front window of frontApp
          return appName & "|" & appPath & "|" & winTitle
        end if
      end try
      return appName & "|" & appPath & "|" & "no title"
    end tell
  '`;
}

export function buildOpenWindowsScript(): string {
  return `osascript -e '
    tell application "System Events"
      set windowList to ""
      repeat with proc in (every application process whose background only is false)
        try
          set appName to name of proc
          set appPath to ""
          set winCount to count of windows of proc
          if winCount > 0 then
            repeat with i from 1 to winCount
              try
                set winTitle to name of window i of proc
                set windowList to windowList & appName & "|" & appPath & "|" & winTitle & "||"
              end try
            end repeat
          end if
        end try
      end repeat
      return windowList
    end tell
  '`;
}

function runActiveWindowScript(): ExternalWindowSnapshot | null {
  const script = buildActiveWindowScript();
  try {
    const output = execSync(script, { timeout: 3000, encoding: 'utf8', maxBuffer: 4096 });
    return parseActiveWindowOutput(output);
  } catch {
    return null;
  }
}

function runOpenWindowsScript(): ExternalWindowSnapshot[] {
  const script = buildOpenWindowsScript();
  try {
    const output = execSync(script, { timeout: 5000, encoding: 'utf8', maxBuffer: 32768 });
    return parseOpenWindowsOutput(output);
  } catch {
    return [];
  }
}

export function resolveNativeMacOSBridge(
  activeWindow: ExternalWindowSnapshot | null,
  openWindows: ExternalWindowSnapshot[],
): NativeBridgeQueryResult {
  const activeProviderId = activeWindow ? mapProviderToId(activeWindow.appName) : null;
  const activeIsSupported = activeProviderId !== null;
  
  const hasSupportedOpenWindow = openWindows.some(w => mapProviderToId(w.appName) !== null);
  
  const capabilities: ActiveSurfaceCapabilities = {
    activeWindowDetection: activeWindow ? 'available' : 'degraded',
    openWindowRegistry: openWindows.length > 0 ? 'available' : 'degraded',
    browserUrlEnrichment: 'unavailable',
    browserNativeMessaging: 'unavailable',
    desktopNotifications: 'available',
    attentionRequest: 'available',
  };
  
  if (activeIsSupported && activeProviderId && activeWindow) {
    const resolution: CoreActiveSurfaceResolution = {
      key: { provider: activeProviderId, externalWindowId: activeWindow.externalWindowId },
      provider: activeProviderId,
      providerSessionId: null,
      resolutionTier: 'tier_2_provider_window',
      confidence: 'medium',
      reason: `Active ${activeWindow.appName} window detected via native macOS`,
      source: 'native_macos_apple_script',
    };
    
    return {
      activeWindow,
      openWindows,
      capabilities,
      resolution,
      source: 'native_macos_apple_script',
      nativeSuccess: true,
    };
  }
  
  if (hasSupportedOpenWindow) {
    const supportedWindows = openWindows.filter(w => mapProviderToId(w.appName) !== null);
    if (supportedWindows.length > 0) {
      const window = supportedWindows[0];
      const provider = mapProviderToId(window.appName);
      if (provider) {
        const resolution: CoreActiveSurfaceResolution = {
          key: { provider, externalWindowId: window.externalWindowId },
          provider,
          providerSessionId: null,
          resolutionTier: 'tier_3_provider_window_plus_candidate_session',
          confidence: 'low',
          reason: `Open ${window.appName} window found via native macOS`,
          source: 'open_window_registry',
        };
        
        return {
          activeWindow,
          openWindows,
          capabilities,
          resolution,
          source: 'native_macos_apple_script',
          nativeSuccess: true,
        };
      }
    }
  }
  
  const resolution: CoreActiveSurfaceResolution = {
    key: null,
    provider: null,
    providerSessionId: null,
    resolutionTier: 'tier_1_latest_session',
    confidence: 'low',
    reason: activeWindow
      ? 'No supported provider window focused - using fallback'
      : 'No active window detected - using fallback',
    source: 'latest_session_fallback',
  };
  
  return {
    activeWindow,
    openWindows,
    capabilities,
    resolution,
    source: 'latest_session_fallback',
    nativeSuccess: false,
  };
}

export function queryNativeMacOSBridge(runners: NativeBridgeScriptRunners = {}): NativeBridgeQueryResult {
  const activeWindow = (runners.runActiveWindowScript ?? runActiveWindowScript)();
  const openWindows = (runners.runOpenWindowsScript ?? runOpenWindowsScript)();
  return resolveNativeMacOSBridge(activeWindow, openWindows);
}

export function fetchActiveSurfaceState(runners: NativeBridgeScriptRunners = {}): ActiveSurfaceState {
  const native = queryNativeMacOSBridge(runners);
  
  return {
    resolution: native.resolution,
    capabilities: native.capabilities,
    windows: native.openWindows,
    isNative: native.nativeSuccess,
    isAvailable: native.nativeSuccess,
    lastUpdated: new Date().toISOString(),
  };
}

export function getSimulatedFallback(): ActiveSurfaceState {
  return {
    resolution: {
      key: null,
      provider: null,
      providerSessionId: null,
      resolutionTier: 'tier_0_none',
      confidence: 'none' as const,
      reason: 'Platform not supported - simulated fallback',
      source: 'none' as const,
    },
    capabilities: { ...DEFAULT_CAPABILITIES },
    windows: [],
    isNative: false,
    isAvailable: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function createActiveSurfaceStateFromSessions(
  sessions: Array<{ provider: string; providerSessionId: string; contextAudit: { contextUsagePercent: number | null } | null }>
): ActiveSurfaceState {
  if (sessions.length === 0) {
    return getSimulatedFallback();
  }
  
  const latestSession = sessions[0];
  const resolution: CoreActiveSurfaceResolution = {
    key: { provider: latestSession.provider as ProviderId, externalWindowId: 'latest-session-fallback' },
    provider: latestSession.provider as ProviderId,
    providerSessionId: latestSession.providerSessionId,
    resolutionTier: 'tier_1_latest_session',
    confidence: 'low',
    reason: 'Latest session fallback - no active window detection available',
    source: 'latest_session_fallback',
  };
  
  return {
    resolution,
    capabilities: { ...DEFAULT_CAPABILITIES },
    windows: [],
    isNative: false,
    isAvailable: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function buildRegistryFromSnapshots(
  windows: ExternalWindowSnapshot[],
): Map<string, WindowRegistryEntry> {
  const registry = new Map<string, WindowRegistryEntry>();
  
  for (const window of windows) {
    const provider = mapProviderToId(window.appName);
    if (!provider) continue;
    
    const key = `${provider}:${window.externalWindowId}`;
    
    registry.set(key, {
      key: { provider, externalWindowId: window.externalWindowId },
      title: window.title,
      appName: window.appName,
      processPath: window.processPath,
      lastSeenAt: window.detectedAt,
      isCurrentlyOpen: true,
      resolutionTier: 'tier_2_provider_window',
      providerSessionId: null,
      contextUsagePercent: null,
      thresholdBand: 'unknown',
      highestNotifiedBand: null,
    });
  }
  
  return registry;
}

export const PROVIDER_APP_MAP = new Map<string, ProviderId>([
  ['codex', 'codex'],
  ['opencode', 'opencode'],
  ['open code', 'opencode'],
  ['claude', 'claude'],
  ['cursor', 'cursor'],
]);

export function getProviderFromAppName(appName: string | null): ProviderId {
  if (!appName) return 'codex';
  const mapped = mapProviderToId(appName);
  return mapped ?? 'codex';
}
