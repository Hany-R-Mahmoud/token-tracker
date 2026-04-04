export interface SessionSummary {
  provider: string;
  sessions: number;
  totalTokens: number;
  totalCostUsd: number;
  averageEfficiency: number | null;
  pricedSessions: number;
  unpricedSessions: number;
  resetWindowKind: string | null;
  resetWindowResetsAt: string | null;
  resetWindowRemainingPercent: number | null;
}

export interface SessionListFilters {
  provider?: string;
  model?: string;
  limit?: number;
  page?: number;
  priced?: boolean;
  unpriced?: boolean;
  search?: string;
}

export interface ModelOption {
  model: string;
  sessionCount: number;
}

export interface SessionListResult {
  sessions: StoredSessionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ScoreFactorRow {
  key: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface StoredSessionListItem {
  id: string;
  provider: string;
  providerSessionId: string;
  startedAt: string;
  model: string | null;
  tokenTotal: number;
  costTotalUsd: number;
  pricingSnapshotId: string | null;
  efficiencyScore: number | null;
  outcome: string;
  title: string | null;
}

export interface StoredSessionDetail extends StoredSessionListItem {
  sourcePath: string;
  projectPath: string | null;
  endedAt: string | null;
  durationMs: number | null;
  tokenInput: number;
  tokenOutput: number;
  tokenCachedInput: number;
  tokenReasoning: number;
  costInputUsd: number;
  costOutputUsd: number;
  costCacheReadUsd: number;
  costCacheWriteUsd: number;
  cacheHitRate: number | null;
  taskCategory: string;
  outcomeConfidence: number | null;
  taskCategoryConfidence: number | null;
  wasteScore: number | null;
  anomalyScore: number | null;
  loopCount: number;
  outcomeReasons: string[];
  wasteReasons: string[];
  scoreFactors: ScoreFactorRow[];
}

export interface ProviderHealthRecord {
  provider: string;
  status: 'ok' | 'degraded' | 'broken';
  lastSuccessfulImportAt: string | null;
  lastCheckedAt: string;
  sourcesFound: number;
  issues: string[];
}

export interface ModelSummary {
  model: string;
  provider: string;
  sessions: number;
  totalTokens: number;
  totalCostUsd: number;
  averageEfficiency: number | null;
  pricedSessions: number;
}

export interface DailyBucket {
  date: string;
  sessions: number;
  totalTokens: number;
  totalCostUsd: number;
  averageEfficiency: number | null;
}

export interface AnalyticsExportBundle {
  exportedAt: string;
  windowDays: number;
  databasePath: string;
  sessionCount: number;
  providerSummaries: SessionSummary[];
  modelSummaries: ModelSummary[];
  dailyBuckets: DailyBucket[];
  recentSessions: StoredSessionListItem[];
}
