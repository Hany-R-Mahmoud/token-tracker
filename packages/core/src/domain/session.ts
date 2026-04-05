export type ProviderId = 'codex' | 'claude' | 'cursor' | 'opencode';

export type SessionOutcome =
  | 'success'
  | 'partial'
  | 'abandoned'
  | 'reverted'
  | 'unknown';

export type CompletionState = 'completed' | 'partial' | 'abandoned' | 'reverted' | 'unknown';
export type VerificationState = 'verified' | 'probable' | 'contradicted' | 'missing';

export type SuccessSignalKind =
  | 'provider_completion'
  | 'verification_command'
  | 'repo_change'
  | 'repair_loop'
  | 'error_burst'
  | 'revert_indicator'
  | 'cache_efficiency'
  | 'human_stop';

export interface SuccessSignal {
  kind: SuccessSignalKind;
  direction: 'positive' | 'negative' | 'neutral';
  weight: number;
  confidence: number;
  label: string;
  evidence: string;
}

export interface SessionSuccessAnalysis {
  completionState: CompletionState;
  verificationState: VerificationState;
  successScore: number | null;
  executionQualityScore: number | null;
  reworkScore: number | null;
  valueDensityScore: number | null;
  analysisConfidence: number | null;
  successSignals: SuccessSignal[];
}

export type TaskCategory =
  | 'bug_fix'
  | 'feature'
  | 'refactor'
  | 'analysis'
  | 'content'
  | 'ops'
  | 'other'
  | 'unknown';

export interface SessionTokenUsage {
  input: number;
  output: number;
  cachedInput: number;
  cachedWrite: number;
  reasoning: number;
  total: number;
}

export interface SessionCostUsage {
  inputUsd: number;
  outputUsd: number;
  cacheReadUsd: number;
  cacheWriteUsd: number;
  totalUsd: number;
  pricingSnapshotId: string | null;
}

export interface SessionCacheUsage {
  hitRate: number | null;
  cacheEligibleTokens: number | null;
}

export interface SessionResetWindow {
  kind: 'session' | 'daily' | 'weekly' | 'monthly' | 'credits';
  resetsAt: string | null;
  remainingPercent: number | null;
}

export interface ScoreFactor {
  key: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface SessionExplanation {
  scoreVersion: string;
  outcomeReasons: string[];
  scoreFactors: ScoreFactor[];
  wasteReasons: string[];
}

export interface SessionMetadata {
  parserVersion: string;
  parserWarnings: string[];
  providerMetadata: Record<string, string | number | boolean | null>;
  containsSensitiveText: boolean;
}

export interface CanonicalSessionSeed {
  provider: ProviderId;
  providerSessionId: string;
  sourcePath: string;
  projectPath: string | null;
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
  durationMs: number | null;
  model: string | null;
  modelFamily: string | null;
  title: string | null;
  messageCount: number;
  toolCallCount: number;
  tokens: SessionTokenUsage;
  costs: SessionCostUsage;
  cache: SessionCacheUsage;
  resetWindow: SessionResetWindow | null;
  metadata: SessionMetadata;
}

export interface CanonicalSession extends CanonicalSessionSeed {
  id: string;
  attemptCount: number;
  outcome: SessionOutcome;
  outcomeConfidence: number | null;
  taskCategory: TaskCategory;
  taskCategoryConfidence: number | null;
  efficiencyScore: number | null;
  wasteScore: number | null;
  anomalyScore: number | null;
  loopCount: number;
  flags: string[];
  explanation: SessionExplanation;
  successAnalysis: SessionSuccessAnalysis;
}
