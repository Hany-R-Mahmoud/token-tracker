import type {
  AnalyticsExportBundle,
  DailyBucket,
  ModelOption,
  ModelSummary,
  ProviderHealthRecord,
  SessionListFilters,
  SessionListResult,
  SessionSummary,
  StoredSessionDetail,
  StoredSessionListItem,
} from './types.js';
import { TtmDatabase } from './database.js';
import { auditSessionContext } from '../domain/context-audit.js';
import type { ContextAuditResult, ContextPressureState } from '../domain/context-audit.js';

export interface ReadSummarySnapshot {
  databasePath: string;
  sessionCount: number;
  providerSummaries: SessionSummary[];
}

export interface ReadAnalyticsSnapshot {
  databasePath: string;
  sessionCount: number;
  providerSummaries: SessionSummary[];
  modelSummaries: ModelSummary[];
  dailyBuckets: DailyBucket[];
  recentSessions: SessionWithContextAudit[];
}

export interface SessionWithContextAudit extends StoredSessionListItem {
  contextAudit: ContextAuditResult;
}

export class TtmReadService {
  public constructor(private readonly database: TtmDatabase) {}

  public getSummarySnapshot(): ReadSummarySnapshot {
    return {
      databasePath: this.database.path,
      sessionCount: this.database.getSessionCount(),
      providerSummaries: this.database.getProviderSummaries(),
    };
  }

  public getAnalyticsSnapshot(days = 30): ReadAnalyticsSnapshot {
    const sessions = this.database.listSessionsForWindow(days, 100) as (StoredSessionListItem & { tokenInput: number; tokenOutput: number; tokenReasoning: number; tokenCachedInput: number; cacheHitRate: number | null })[];
    const recentSessions: SessionWithContextAudit[] = sessions.map(s => ({
      ...s,
      contextAudit: auditSessionContext(
        s.tokenInput,
        s.tokenOutput,
        s.tokenReasoning,
        s.tokenCachedInput,
        0,
        s.model,
        0,
        null,
        s.cacheHitRate,
        s.successScore,
        null
      ),
    }));
    return {
      databasePath: this.database.path,
      sessionCount: this.database.getSessionCountForWindow(days),
      providerSummaries: this.database.getProviderSummariesForWindow(days),
      modelSummaries: this.database.getModelSummariesForWindow(days),
      dailyBuckets: this.database.getDailyBuckets(days),
      recentSessions,
    };
  }

  public buildExportBundle(days: number): AnalyticsExportBundle {
    return {
      exportedAt: new Date().toISOString(),
      windowDays: days,
      databasePath: this.database.path,
      sessionCount: this.database.getSessionCountForWindow(days),
      providerSummaries: this.database.getProviderSummariesForWindow(days),
      modelSummaries: this.database.getModelSummariesForWindow(days),
      dailyBuckets: this.database.getDailyBuckets(days),
      recentSessions: this.database.listSessionsForWindow(days),
    };
  }

  public listRecentSessions(filters: SessionListFilters = {}): StoredSessionListItem[] {
    return this.database.listSessions(filters);
  }

  public listSessionsWithCount(filters: SessionListFilters = {}): SessionListResult {
    return this.database.listSessionsWithCount(filters);
  }

  public getModelOptions(): ModelOption[] {
    return this.database.getModelOptions();
  }

  public getSessionDetail(sessionId: string): StoredSessionDetail | null {
    return this.database.getSessionDetail(sessionId);
  }

  public listProviderHealth(): ProviderHealthRecord[] {
    return this.database.listProviderHealth();
  }

  public getProviderHealth(provider: string): ProviderHealthRecord | null {
    return this.database.getProviderHealth(provider);
  }
}
