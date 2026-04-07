import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSupportedProvider,
  mapProviderToId,
  parseActiveWindowOutput,
  parseOpenWindowsOutput,
  buildActiveWindowScript,
  buildOpenWindowsScript,
  generateWindowId,
  getSimulatedFallback,
  createActiveSurfaceStateFromSessions,
  getProviderFromAppName,
  PROVIDER_APP_MAP,
  resolveNativeMacOSBridge,
  queryNativeMacOSBridge,
  fetchActiveSurfaceState,
} from './tauri-bridge.js';

describe('mapProviderToId', () => {
  it('returns codex for Codex app name', () => {
    assert.strictEqual(mapProviderToId('Codex'), 'codex');
    assert.strictEqual(mapProviderToId('CODEX'), 'codex');
  });

  it('returns opencode for OpenCode app name', () => {
    assert.strictEqual(mapProviderToId('OpenCode'), 'opencode');
    assert.strictEqual(mapProviderToId('opencode'), 'opencode');
    assert.strictEqual(mapProviderToId('Open Code'), 'opencode');
  });

  it('returns claude for Claude app name', () => {
    assert.strictEqual(mapProviderToId('Claude'), 'claude');
    assert.strictEqual(mapProviderToId('claude'), 'claude');
  });

  it('returns cursor for Cursor app name', () => {
    assert.strictEqual(mapProviderToId('Cursor'), 'cursor');
    assert.strictEqual(mapProviderToId('cursor'), 'cursor');
  });

  it('returns null for unknown apps', () => {
    assert.strictEqual(mapProviderToId('Chrome'), null);
    assert.strictEqual(mapProviderToId('Safari'), null);
    assert.strictEqual(mapProviderToId('Unknown App'), null);
    assert.strictEqual(mapProviderToId('iTerm2'), null);
  });

  it('returns null for null input', () => {
    assert.strictEqual(mapProviderToId(null), null);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(mapProviderToId(''), null);
  });
});

describe('isSupportedProvider', () => {
  it('returns true for supported providers', () => {
    assert.strictEqual(isSupportedProvider('codex'), true);
    assert.strictEqual(isSupportedProvider('opencode'), true);
    assert.strictEqual(isSupportedProvider('claude'), true);
    assert.strictEqual(isSupportedProvider('cursor'), true);
  });

  it('returns false for unknown apps', () => {
    assert.strictEqual(isSupportedProvider('Chrome'), false);
    assert.strictEqual(isSupportedProvider('Safari'), false);
    assert.strictEqual(isSupportedProvider('Unknown'), false);
  });

  it('returns false for null', () => {
    assert.strictEqual(isSupportedProvider(null), false);
  });

  it('is case insensitive', () => {
    assert.strictEqual(isSupportedProvider('CODEX'), true);
    assert.strictEqual(isSupportedProvider('OpenCode'), true);
  });
});

describe('parseActiveWindowOutput', () => {
  it('parses valid output correctly', () => {
    const result = parseActiveWindowOutput('Codex|/Applications/Codex.app|My Project.ts');
    assert.strictEqual(result?.appName, 'Codex');
    assert.strictEqual(result?.processPath, '/Applications/Codex.app');
    assert.strictEqual(result?.title, 'My Project.ts');
    assert.ok(result?.externalWindowId.startsWith('native-codex-'));
  });

  it('parses output without title', () => {
    const result = parseActiveWindowOutput('Codex|/Applications/Codex.app|no title');
    assert.strictEqual(result?.title, null);
  });

  it('normalizes empty process paths to null', () => {
    const result = parseActiveWindowOutput('Codex||Editor');
    assert.strictEqual(result?.processPath, null);
  });

  it('returns null for empty output', () => {
    assert.strictEqual(parseActiveWindowOutput(''), null);
  });

  it('returns null for malformed output', () => {
    assert.strictEqual(parseActiveWindowOutput('Codex'), null);
  });
});

describe('parseOpenWindowsOutput', () => {
  it('parses multiple windows correctly', () => {
    const result = parseOpenWindowsOutput('Codex|/Path/Codex.app|File1.ts||OpenCode|/Path/OpenCode.app|File2.ts');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].appName, 'Codex');
    assert.strictEqual(result[0].title, 'File1.ts');
    assert.strictEqual(result[1].appName, 'OpenCode');
    assert.strictEqual(result[1].title, 'File2.ts');
  });

  it('generates stable IDs with index', () => {
    const result = parseOpenWindowsOutput('Codex|/Path/Codex.app|File1.ts||Codex|/Path/Codex.app|File2.ts');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].externalWindowId, 'native-codex-0');
    assert.strictEqual(result[1].externalWindowId, 'native-codex-1');
  });

  it('skips malformed entries', () => {
    const result = parseOpenWindowsOutput('Codex|/Path||Invalid');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].appName, 'Codex');
  });
});

describe('buildActiveWindowScript', () => {
  it('returns a deterministic osascript command string', () => {
    const script = buildActiveWindowScript();
    assert.ok(script.startsWith('osascript'));
    assert.ok(script.includes('System Events'));
    assert.ok(script.includes('frontmost'));
    assert.ok(script.includes('return appName'));
    assert.ok(!script.includes('path to application'));
  });

  it('produces consistent output', () => {
    const script1 = buildActiveWindowScript();
    const script2 = buildActiveWindowScript();
    assert.strictEqual(script1, script2);
  });
});

describe('buildOpenWindowsScript', () => {
  it('returns a deterministic osascript command string', () => {
    const script = buildOpenWindowsScript();
    assert.ok(script.startsWith('osascript'));
    assert.ok(script.includes('System Events'));
    assert.ok(script.includes('background only is false'));
    assert.ok(script.includes('return windowList'));
    assert.ok(!script.includes('path to application'));
  });

  it('produces consistent output', () => {
    const script1 = buildOpenWindowsScript();
    const script2 = buildOpenWindowsScript();
    assert.strictEqual(script1, script2);
  });
});

describe('getSimulatedFallback', () => {
  it('returns state with tier_0_none when no data available', () => {
    const state = getSimulatedFallback();
    assert.strictEqual(state.resolution?.resolutionTier, 'tier_0_none');
    assert.strictEqual(state.isNative, false);
    assert.strictEqual(state.isAvailable, false);
    assert.strictEqual(state.capabilities.activeWindowDetection, 'unavailable');
  });

  it('includes default capabilities', () => {
    const state = getSimulatedFallback();
    assert.strictEqual(state.capabilities.desktopNotifications, 'unavailable');
    assert.ok(Array.isArray(state.windows));
  });
});

describe('createActiveSurfaceStateFromSessions', () => {
  it('returns fallback when sessions array is empty', () => {
    const state = createActiveSurfaceStateFromSessions([]);
    assert.strictEqual(state.resolution?.resolutionTier, 'tier_0_none');
    assert.strictEqual(state.isNative, false);
  });

  it('returns tier_1_latest_session when sessions exist', () => {
    const sessions = [
      {
        provider: 'codex',
        providerSessionId: 'test-session-123',
        contextAudit: { contextUsagePercent: 65.5 },
      },
    ];
    const state = createActiveSurfaceStateFromSessions(sessions as any);
    assert.strictEqual(state.resolution?.resolutionTier, 'tier_1_latest_session');
    assert.strictEqual(state.resolution?.source, 'latest_session_fallback');
    assert.strictEqual(state.resolution?.provider, 'codex');
    assert.strictEqual(state.isNative, false);
    assert.strictEqual(state.isAvailable, false);
  });

  it('handles sessions without contextAudit', () => {
    const sessions = [{ provider: 'opencode', providerSessionId: 'test-456' }];
    const state = createActiveSurfaceStateFromSessions(sessions as any);
    assert.strictEqual(state.resolution?.resolutionTier, 'tier_1_latest_session');
    assert.strictEqual(state.resolution?.provider, 'opencode');
  });
});

describe('getProviderFromAppName', () => {
  it('returns codex for null input', () => {
    assert.strictEqual(getProviderFromAppName(null), 'codex');
  });

  it('returns matching provider for known apps', () => {
    assert.strictEqual(getProviderFromAppName('Codex'), 'codex');
    assert.strictEqual(getProviderFromAppName('OpenCode'), 'opencode');
    assert.strictEqual(getProviderFromAppName('Claude'), 'claude');
    assert.strictEqual(getProviderFromAppName('Cursor'), 'cursor');
  });

  it('returns codex for unknown apps (backward compat)', () => {
    assert.strictEqual(getProviderFromAppName('UnknownApp'), 'codex');
  });

  it('handles case-insensitive matching', () => {
    assert.strictEqual(getProviderFromAppName('CODEX'), 'codex');
    assert.strictEqual(getProviderFromAppName('Open Code'), 'opencode');
  });
});

describe('PROVIDER_APP_MAP', () => {
  it('contains expected provider mappings', () => {
    assert.strictEqual(PROVIDER_APP_MAP.get('codex'), 'codex');
    assert.strictEqual(PROVIDER_APP_MAP.get('opencode'), 'opencode');
    assert.strictEqual(PROVIDER_APP_MAP.get('open code'), 'opencode');
    assert.strictEqual(PROVIDER_APP_MAP.get('claude'), 'claude');
    assert.strictEqual(PROVIDER_APP_MAP.get('cursor'), 'cursor');
  });
});

describe('queryNativeMacOSBridge', () => {
  it('returns a valid structure', () => {
    const result = queryNativeMacOSBridge({
      runActiveWindowScript: () => parseActiveWindowOutput('Codex||Editor'),
      runOpenWindowsScript: () => parseOpenWindowsOutput('Codex| |Editor'),
    });
    assert.ok(result.resolution !== null);
    assert.ok(result.capabilities !== null);
    assert.ok(Array.isArray(result.openWindows));
    assert.ok(typeof result.source === 'string');
    assert.strictEqual(typeof result.nativeSuccess, 'boolean');
  });

  it('has nativeSuccess true only when native resolution succeeded', () => {
    const result = queryNativeMacOSBridge({
      runActiveWindowScript: () => parseActiveWindowOutput('Codex||Editor'),
      runOpenWindowsScript: () => [],
    });
    assert.strictEqual(result.nativeSuccess, true);
    assert.strictEqual(result.source, 'native_macos_apple_script');
  });

  it('returns fallback resolution when runners produce no native data', () => {
    const result = queryNativeMacOSBridge({
      runActiveWindowScript: () => null,
      runOpenWindowsScript: () => [],
    });
    assert.strictEqual(result.nativeSuccess, false);
    assert.strictEqual(result.resolution.resolutionTier, 'tier_1_latest_session');
    assert.strictEqual(result.resolution.source, 'latest_session_fallback');
  });
});

describe('generateWindowId', () => {
  it('creates deterministic IDs', () => {
    assert.strictEqual(generateWindowId('Open Code', 1), 'native-open-code-1');
  });
});

describe('resolveNativeMacOSBridge', () => {
  it('returns native success for a supported active window', () => {
    const activeWindow = parseActiveWindowOutput('Codex||Editor')!;
    const result = resolveNativeMacOSBridge(activeWindow, []);

    assert.strictEqual(result.nativeSuccess, true);
    assert.strictEqual(result.resolution.resolutionTier, 'tier_2_provider_window');
    assert.strictEqual(result.resolution.provider, 'codex');
    assert.strictEqual(result.resolution.source, 'native_macos_apple_script');
  });

  it('falls back when the focused app is unsupported', () => {
    const activeWindow = parseActiveWindowOutput('Safari||Docs')!;
    const result = resolveNativeMacOSBridge(activeWindow, []);

    assert.strictEqual(result.nativeSuccess, false);
    assert.strictEqual(result.resolution.resolutionTier, 'tier_1_latest_session');
    assert.strictEqual(result.resolution.source, 'latest_session_fallback');
  });

  it('uses open window registry when a supported provider window exists', () => {
    const activeWindow = parseActiveWindowOutput('Safari||Docs')!;
    const openWindows = parseOpenWindowsOutput('Safari| |Docs||OpenCode| |Project.ts');
    const result = resolveNativeMacOSBridge(activeWindow, openWindows);

    assert.strictEqual(result.nativeSuccess, true);
    assert.strictEqual(result.resolution.resolutionTier, 'tier_3_provider_window_plus_candidate_session');
    assert.strictEqual(result.resolution.provider, 'opencode');
    assert.strictEqual(result.resolution.source, 'open_window_registry');
  });

  it('returns degraded capabilities when no windows are available', () => {
    const result = resolveNativeMacOSBridge(null, []);

    assert.strictEqual(result.nativeSuccess, false);
    assert.strictEqual(result.capabilities.activeWindowDetection, 'degraded');
    assert.strictEqual(result.capabilities.openWindowRegistry, 'degraded');
    assert.strictEqual(result.resolution.resolutionTier, 'tier_1_latest_session');
  });
});

describe('fetchActiveSurfaceState', () => {
  it('isAvailable is true only when native succeeded', () => {
    const state = fetchActiveSurfaceState({
      runActiveWindowScript: () => parseActiveWindowOutput('Codex||Editor'),
      runOpenWindowsScript: () => [],
    });
    assert.strictEqual(state.isAvailable, true);
  });

  it('isNative reflects native source only on success', () => {
    const state = fetchActiveSurfaceState({
      runActiveWindowScript: () => null,
      runOpenWindowsScript: () => [],
    });
    assert.strictEqual(state.isNative, false);
  });
});
