import type { CanonicalSessionSeed, ProviderId } from '../domain/session.js';

export interface ProviderCheckpoint {
  provider: ProviderId;
  sourceId: string;
  cursorType: 'byte_offset' | 'mtime' | 'row_id' | 'timestamp';
  cursorValue: string;
  updatedAt: string;
}

export interface DiscoveredSource {
  id: string;
  path: string;
  kind: 'file' | 'directory' | 'sqlite';
}

export interface AdapterImportMetrics {
  scannedSources: number;
  importedSessions: number;
  skippedRecords: number;
}

export interface DiscoveryResult {
  sources: DiscoveredSource[];
  warnings: string[];
}

export interface ImportResult {
  sessions: CanonicalSessionSeed[];
  checkpointWrites: ProviderCheckpoint[];
  warnings: string[];
  metrics: AdapterImportMetrics;
}

export interface AdapterHealth {
  status: 'ok' | 'degraded' | 'broken';
  sourcesFound: number;
  lastSuccessfulImportAt: string | null;
  issues: string[];
}

export interface ProviderPaths {
  codexRoot?: string;
  claudeRoot?: string;
  cursorRoot?: string;
  opencodeRoot?: string;
}

export interface AdapterLimits {
  maxFilesPerPass: number;
  maxBytesPerFile: number;
}

export interface AdapterStorage {
  readCheckpoint(provider: ProviderId, sourceId: string): Promise<ProviderCheckpoint | null>;
  writeCheckpoints(checkpoints: ProviderCheckpoint[]): Promise<void>;
}

export interface ModelPricing {
  inputPerMillionUsd: number | null;
  outputPerMillionUsd: number | null;
  cacheReadPerMillionUsd: number | null;
  cacheWritePerMillionUsd: number | null;
  pricingSnapshotId: string | null;
  pricingSource: string | null;
  displayModel: string | null;
}

export interface PricingReader {
  getModelPricing(model: string | null): Promise<ModelPricing>;
}

export interface AdapterContext {
  storage: AdapterStorage;
  pricing: PricingReader;
  clock: Date;
  paths: ProviderPaths;
  limits: AdapterLimits;
}

export interface ProviderAdapter {
  readonly provider: ProviderId;
  readonly version: string;

  discover(context: AdapterContext): Promise<DiscoveryResult>;
  import(context: AdapterContext): Promise<ImportResult>;
  healthCheck(context: AdapterContext): Promise<AdapterHealth>;
}

export type ProviderSourceKind = 'local_logs' | 'local_db' | 'browser_cookies' | 'provider_api' | 'hybrid';
export type ProviderStrategyStatus = 'validated' | 'experimental' | 'strategy_pending' | 'unavailable';

export type ProviderIncidentStatus = 'ok' | 'degraded' | 'incident' | 'auth_needed' | 'maintenance';

export interface ProviderStatusEntry {
  provider: string;
  strategyStatus: ProviderStrategyStatus;
  incidentStatus: ProviderIncidentStatus;
  note: string;
  incidentNote: string | null;
  lastCheckedAt: string | null;
}

export interface ProviderSourceStrategy {
  provider: string;
  kind: ProviderSourceKind | null;
  status: ProviderStrategyStatus;
  machineNotes: string[];
  evidencePath: string | null;
}

export interface ProviderStatusEntry {
  provider: string;
  strategyStatus: ProviderStrategyStatus;
  note: string;
}

export const KNOWN_PROVIDERS: readonly ProviderStatusEntry[] = [
  {
    provider: 'codex',
    strategyStatus: 'validated',
    incidentStatus: 'ok',
    note: 'local logs parsed from ~/.codex/sessions/*.jsonl',
    incidentNote: null,
    lastCheckedAt: null,
  },
  {
    provider: 'opencode',
    strategyStatus: 'validated',
    incidentStatus: 'ok',
    note: 'local SQLite parsed from ~/.local/share/opencode/opencode.db',
    incidentNote: null,
    lastCheckedAt: null,
  },
  {
    provider: 'cursor',
    strategyStatus: 'strategy_pending',
    incidentStatus: 'auth_needed',
    note: 'auth token accessible locally but no usage/quota/session API surface found — gRPC schema unknown',
    incidentNote: 'Cursor auth tokens exist in state.vscdb but no REST API for usage data. gRPC schema undocumented.',
    lastCheckedAt: null,
  },
  {
    provider: 'claude',
    strategyStatus: 'unavailable',
    incidentStatus: 'ok',
    note: 'no validated local session source',
    incidentNote: null,
    lastCheckedAt: null,
  },
] as const;
