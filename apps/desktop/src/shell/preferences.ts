export interface MonitoringPreferences {
  refreshCadenceSeconds: number;
  defaultAnalyticsWindowDays: number;
}

const DEFAULT_PREFERENCES: MonitoringPreferences = {
  refreshCadenceSeconds: 5,
  defaultAnalyticsWindowDays: 30,
};

const STORAGE_KEY = 'ttm-monitoring-prefs';

export function loadPreferences(): MonitoringPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      refreshCadenceSeconds: typeof parsed.refreshCadenceSeconds === 'number'
        ? Math.max(1, Math.min(60, Math.trunc(parsed.refreshCadenceSeconds)))
        : DEFAULT_PREFERENCES.refreshCadenceSeconds,
      defaultAnalyticsWindowDays: typeof parsed.defaultAnalyticsWindowDays === 'number'
        ? [7, 14, 30, 90].includes(parsed.defaultAnalyticsWindowDays)
          ? parsed.defaultAnalyticsWindowDays
          : DEFAULT_PREFERENCES.defaultAnalyticsWindowDays
        : DEFAULT_PREFERENCES.defaultAnalyticsWindowDays,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: MonitoringPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may be unavailable; non-critical
  }
}

export function resetPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-critical
  }
}
