import type { ProviderId } from './session.js';

export type { ProviderId } from './session.js';

export interface ProviderWindowKey {
  provider: ProviderId;
  externalWindowId: string;
}

export interface ExternalWindowSnapshot {
  externalWindowId: string;
  title: string | null;
  appName: string | null;
  processId: number | null;
  processPath: string | null;
  bounds: { x: number; y: number; width: number; height: number } | null;
  detectedAt: string;
}

export type MatchConfidence = 'high' | 'medium' | 'low' | 'none';

export interface ActiveContextMatch {
  key: ProviderWindowKey | null;
  providerSessionId: string | null;
  provider: ProviderId | null;
  confidence: MatchConfidence;
  reason: string;
}

export type ContextThresholdBand =
  | 'normal'
  | 'warning_75'
  | 'warning_85'
  | 'warning_90'
  | 'unknown';

export type ContextSignalColor = 'green' | 'yellow' | 'red' | 'neutral';

export interface WindowContextSignal {
  key: ProviderWindowKey;
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  thresholdBand: ContextThresholdBand;
  color: ContextSignalColor;
  lastCrossedAt: string | null;
  resolutionConfidence: MatchConfidence;
}

export interface NotificationCheckpoint {
  key: ProviderWindowKey;
  highestNotifiedBand: 'warning_75' | 'warning_85' | 'warning_90' | null;
  lastNotifiedAt: string | null;
}

export interface NotificationEvent {
  key: ProviderWindowKey;
  band: 'warning_75' | 'warning_85' | 'warning_90';
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  triggeredAt: string;
}

export interface ProviderWindowMatcher {
  match(snapshot: ExternalWindowSnapshot): ActiveContextMatch;
  readonly provider: ProviderId;
}

export const THRESHOLDS = {
  warning_75: 75,
  warning_85: 85,
  warning_90: 90,
} as const;

export const THRESHOLD_ORDER: ContextThresholdBand[] = [
  'normal',
  'warning_75',
  'warning_85',
  'warning_90',
];

export function deriveThresholdBand(contextUsagePercent: number | null): ContextThresholdBand {
  if (contextUsagePercent === null) return 'unknown';
  if (contextUsagePercent >= 90) return 'warning_90';
  if (contextUsagePercent >= 85) return 'warning_85';
  if (contextUsagePercent >= 75) return 'warning_75';
  return 'normal';
}

export function bandToColor(band: ContextThresholdBand): ContextSignalColor {
  switch (band) {
    case 'warning_90': return 'red';
    case 'warning_85':
    case 'warning_75': return 'yellow';
    case 'normal': return 'green';
    case 'unknown': return 'neutral';
  }
}

export function bandLabel(band: ContextThresholdBand): string {
  switch (band) {
    case 'warning_90': return 'Critical (≥90%)';
    case 'warning_85': return 'Warning (≥85%)';
    case 'warning_75': return 'Caution (≥75%)';
    case 'normal': return 'Normal';
    case 'unknown': return 'Unknown';
  }
}

export function shouldFireNotification(
  currentBand: ContextThresholdBand,
  checkpoint: NotificationCheckpoint | null,
): NotificationEvent | null {
  if (currentBand === 'normal' || currentBand === 'unknown') return null;
  if (!checkpoint) return null;

  const currentBandLevel = THRESHOLD_ORDER.indexOf(currentBand);
  const highestNotified = checkpoint.highestNotifiedBand;
  const highestLevel = highestNotified !== null ? THRESHOLD_ORDER.indexOf(highestNotified) : -1;

  if (currentBandLevel > highestLevel) {
    return {
      key: checkpoint.key,
      band: currentBand as 'warning_75' | 'warning_85' | 'warning_90',
      providerSessionId: null,
      contextUsagePercent: null,
      triggeredAt: new Date().toISOString(),
    };
  }

  return null;
}

export function updateCheckpoint(
  checkpoint: NotificationCheckpoint | null,
  event: NotificationEvent | null,
): NotificationCheckpoint | null {
  if (!event) return checkpoint;

  return {
    key: event.key,
    highestNotifiedBand: event.band,
    lastNotifiedAt: event.triggeredAt,
  };
}

export function resetCheckpointForBand(
  checkpoint: NotificationCheckpoint | null,
  currentBand: ContextThresholdBand,
): NotificationCheckpoint | null {
  if (!checkpoint) return null;

  const currentLevel = THRESHOLD_ORDER.indexOf(currentBand);
  const notifiedLevel = checkpoint.highestNotifiedBand !== null
    ? THRESHOLD_ORDER.indexOf(checkpoint.highestNotifiedBand)
    : -1;

  if (currentLevel < notifiedLevel) {
    if (currentLevel === 0) {
      return null;
    }
    return {
      ...checkpoint,
      highestNotifiedBand: THRESHOLD_ORDER[currentLevel] as 'warning_75' | 'warning_85' | 'warning_90',
    };
  }

  return checkpoint;
}
