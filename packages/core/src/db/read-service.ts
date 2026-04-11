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
import type { DesktopPeriodId } from './desktop-period.js';
import { periodIdToHours } from './desktop-period.js';

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

  public getSummarySnapshotForPeriod(period: DesktopPeriodId): ReadSummarySnapshot {
    if (period === 'all') {
      return this.getSummarySnapshot();
    }
    
    const hours = periodIdToHours(period);
    const days = hours / 24;
    
    return {
      databasePath: this.database.path,
      sessionCount: this.database.getSessionCountForWindow(hours),
      providerSummaries: hours <= 24
        ? this.database.getProviderSummariesForWindowHours(hours)
        : this.database.getProviderSummariesForWindow(days),
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
      sessionCount: this.database.getSessionCountForWindowDaysOrHours(days, 'days'),
      providerSummaries: this.database.getProviderSummariesForWindow(days),
      modelSummaries: this.database.getModelSummariesForWindow(days),
      dailyBuckets: this.database.getDailyBuckets(days),
      recentSessions,
    };
  }

  public getAnalyticsSnapshotForPeriod(period: DesktopPeriodId): ReadAnalyticsSnapshot {
    if (period === 'all') {
      return this.getAnalyticsSnapshot(36500);
    }
    
    // Use periodIdToHours for truthful rolling window semantics
    const hours = periodIdToHours(period);
    const sessions = this.database.listSessionsForWindowHours(hours, 100) as (StoredSessionListItem & { tokenInput: number; tokenOutput: number; tokenReasoning: number; tokenCachedInput: number; cacheHitRate: number | null })[];
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
      sessionCount: this.database.getSessionCountForWindowHours(hours),
      providerSummaries: this.database.getProviderSummariesForWindowHours(hours),
      modelSummaries: this.database.getModelSummariesForWindowHours(hours),
      dailyBuckets: hours <= 24
        ? this.database.getHourlyBuckets(hours)
        : this.database.getDailyBuckets(Math.floor(hours / 24)),
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

  public listRecentSessionsForPeriod(period: DesktopPeriodId, filters: SessionListFilters = {}): StoredSessionListItem[] {
    if (period === 'all') {
      return this.database.listSessions(filters);
    }
    const hours = periodIdToHours(period);
    // For period-filtered sessions, we use the window method and apply in-memory filtering
    // for additional filters (provider, model, search) since the window method doesn't support complex where clauses
    const windowSessions = this.database.listSessionsForWindowHours(hours, 100);
    
    // Apply filters in-memory for period-scoped results
    let filtered = windowSessions;
    if (filters.provider) {
      filtered = filtered.filter(s => s.provider === filters.provider);
    }
    if (filters.model) {
      filtered = filtered.filter(s => s.model === filters.model);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(searchLower) ||
        s.providerSessionId?.toLowerCase().includes(searchLower) ||
        s.model?.toLowerCase().includes(searchLower)
      );
    }
    return filtered.slice(0, filters.limit ?? 20);
  }

  public listSessionsWithCount(filters: SessionListFilters = {}): SessionListResult {
    return this.database.listSessionsWithCount(filters);
  }

  /**
   * Period-aware paginated session listing.
   */
  public listSessionsWithCountForPeriod(periodId: string, filters: SessionListFilters = {}): SessionListResult {
    return this.database.listSessionsWithCountForPeriod(periodId, filters);
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
