import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { AdapterStorage, ProviderCheckpoint } from '../adapters/types.js';
import type { CanonicalSession, ScoreFactor } from '../domain/session.js';
import { SQLITE_SCHEMA_STATEMENTS } from './sqlite-schema.js';
import type {
  DailyBucket,
  ModelSummary,
  ProviderHealthRecord,
  SessionListFilters,
  SessionListResult,
  SessionSummary,
  StoredSessionDetail,
  StoredSessionListItem,
  ModelOption,
  ScoreFactorRow,
} from './types.js';

export class TtmDatabase implements AdapterStorage {
  private readonly database: DatabaseSync;

  public constructor(databasePath = defaultDatabasePath()) {
    mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec('PRAGMA foreign_keys = ON');
    this.database.exec(SQLITE_SCHEMA_STATEMENTS.join(';\n'));
  }

  public get path(): string {
    const result = this.database.prepare('PRAGMA database_list').all() as Array<{
      file: string;
    }>;

    return result[0]?.file ?? '';
  }

  public async readCheckpoint(
    provider: ProviderCheckpoint['provider'],
    sourceId: string,
  ): Promise<ProviderCheckpoint | null> {
    const row = this.database.prepare(`
      SELECT provider, source_id, cursor_type, cursor_value, updated_at
      FROM provider_checkpoints
      WHERE provider = ? AND source_id = ?
    `).get(provider, sourceId) as
      | {
          provider: ProviderCheckpoint['provider'];
          source_id: string;
          cursor_type: ProviderCheckpoint['cursorType'];
          cursor_value: string;
          updated_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      provider: row.provider,
      sourceId: row.source_id,
      cursorType: row.cursor_type,
      cursorValue: row.cursor_value,
      updatedAt: row.updated_at,
    };
  }

  public async writeCheckpoints(checkpoints: ProviderCheckpoint[]): Promise<void> {
    const statement = this.database.prepare(`
      INSERT INTO provider_checkpoints (provider, source_id, cursor_type, cursor_value, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(provider, source_id) DO UPDATE SET
        cursor_type = excluded.cursor_type,
        cursor_value = excluded.cursor_value,
        updated_at = excluded.updated_at
    `);

    for (const checkpoint of checkpoints) {
      statement.run(
        checkpoint.provider,
        checkpoint.sourceId,
        checkpoint.cursorType,
        checkpoint.cursorValue,
        checkpoint.updatedAt,
      );
    }
  }

  public upsertSession(session: CanonicalSession): void {
    const insertSession = this.database.prepare(`
      INSERT INTO sessions (
        id, provider, provider_session_id, source_path, project_path, started_at,
        ended_at, last_activity_at, duration_ms, model, model_family, title,
        message_count, tool_call_count, attempt_count, token_input, token_output,
        token_cached_input, token_cached_write, token_reasoning, token_total,
        cost_input_usd, cost_output_usd, cost_cache_read_usd, cost_cache_write_usd,
        cost_total_usd, pricing_snapshot_id, cache_hit_rate, cache_eligible_tokens,
        outcome, outcome_confidence, task_category, task_category_confidence,
        efficiency_score, waste_score, anomaly_score, loop_count,
        completion_state, verification_state, success_score, execution_quality_score,
        rework_score, value_density_score, analysis_confidence, success_signals_json,
        reset_window_kind, reset_window_resets_at, reset_window_remaining_percent,
        score_version, parser_version, contains_sensitive_text, created_at, updated_at
      ) VALUES (
        @id, @provider, @providerSessionId, @sourcePath, @projectPath, @startedAt,
        @endedAt, @lastActivityAt, @durationMs, @model, @modelFamily, @title,
        @messageCount, @toolCallCount, @attemptCount, @tokenInput, @tokenOutput,
        @tokenCachedInput, @tokenCachedWrite, @tokenReasoning, @tokenTotal,
        @costInputUsd, @costOutputUsd, @costCacheReadUsd, @costCacheWriteUsd,
        @costTotalUsd, @pricingSnapshotId, @cacheHitRate, @cacheEligibleTokens,
        @outcome, @outcomeConfidence, @taskCategory, @taskCategoryConfidence,
        @efficiencyScore, @wasteScore, @anomalyScore, @loopCount,
        @completionState, @verificationState, @successScore, @executionQualityScore,
        @reworkScore, @valueDensityScore, @analysisConfidence, @successSignalsJson,
        @resetWindowKind, @resetWindowResetsAt, @resetWindowRemainingPercent,
        @scoreVersion, @parserVersion, @containsSensitiveText, @createdAt, @updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        provider = excluded.provider,
        provider_session_id = excluded.provider_session_id,
        source_path = excluded.source_path,
        project_path = excluded.project_path,
        started_at = excluded.started_at,
        ended_at = excluded.ended_at,
        last_activity_at = excluded.last_activity_at,
        duration_ms = excluded.duration_ms,
        model = excluded.model,
        model_family = excluded.model_family,
        title = excluded.title,
        message_count = excluded.message_count,
        tool_call_count = excluded.tool_call_count,
        attempt_count = excluded.attempt_count,
        token_input = excluded.token_input,
        token_output = excluded.token_output,
        token_cached_input = excluded.token_cached_input,
        token_cached_write = excluded.token_cached_write,
        token_reasoning = excluded.token_reasoning,
        token_total = excluded.token_total,
        cost_input_usd = excluded.cost_input_usd,
        cost_output_usd = excluded.cost_output_usd,
        cost_cache_read_usd = excluded.cost_cache_read_usd,
        cost_cache_write_usd = excluded.cost_cache_write_usd,
        cost_total_usd = excluded.cost_total_usd,
        pricing_snapshot_id = excluded.pricing_snapshot_id,
        cache_hit_rate = excluded.cache_hit_rate,
        cache_eligible_tokens = excluded.cache_eligible_tokens,
        outcome = excluded.outcome,
        outcome_confidence = excluded.outcome_confidence,
        task_category = excluded.task_category,
        task_category_confidence = excluded.task_category_confidence,
        efficiency_score = excluded.efficiency_score,
        waste_score = excluded.waste_score,
        anomaly_score = excluded.anomaly_score,
        loop_count = excluded.loop_count,
        completion_state = excluded.completion_state,
        verification_state = excluded.verification_state,
        success_score = excluded.success_score,
        execution_quality_score = excluded.execution_quality_score,
        rework_score = excluded.rework_score,
        value_density_score = excluded.value_density_score,
        analysis_confidence = excluded.analysis_confidence,
        success_signals_json = excluded.success_signals_json,
        reset_window_kind = excluded.reset_window_kind,
        reset_window_resets_at = excluded.reset_window_resets_at,
        reset_window_remaining_percent = excluded.reset_window_remaining_percent,
        score_version = excluded.score_version,
        parser_version = excluded.parser_version,
        contains_sensitive_text = excluded.contains_sensitive_text,
        updated_at = excluded.updated_at
    `);

    const now = new Date().toISOString();
    const sa = session.successAnalysis;
    insertSession.run({
      anomalyScore: session.anomalyScore,
      attemptCount: session.attemptCount,
      cacheEligibleTokens: session.cache.cacheEligibleTokens,
      cacheHitRate: session.cache.hitRate,
      containsSensitiveText: session.metadata.containsSensitiveText ? 1 : 0,
      costCacheReadUsd: session.costs.cacheReadUsd,
      costCacheWriteUsd: session.costs.cacheWriteUsd,
      costInputUsd: session.costs.inputUsd,
      costOutputUsd: session.costs.outputUsd,
      costTotalUsd: session.costs.totalUsd,
      durationMs: session.durationMs,
      efficiencyScore: session.efficiencyScore,
      endedAt: session.endedAt,
      id: session.id,
      lastActivityAt: session.lastActivityAt,
      loopCount: session.loopCount,
      messageCount: session.messageCount,
      model: session.model,
      modelFamily: session.modelFamily,
      outcome: session.outcome,
      outcomeConfidence: session.outcomeConfidence,
      parserVersion: session.metadata.parserVersion,
      pricingSnapshotId: session.costs.pricingSnapshotId,
      projectPath: session.projectPath,
      provider: session.provider,
      providerSessionId: session.providerSessionId,
      resetWindowKind: session.resetWindow?.kind ?? null,
      resetWindowRemainingPercent: session.resetWindow?.remainingPercent ?? null,
      resetWindowResetsAt: session.resetWindow?.resetsAt ?? null,
      scoreVersion: session.explanation.scoreVersion,
      sourcePath: session.sourcePath,
      startedAt: session.startedAt,
      taskCategory: session.taskCategory,
      taskCategoryConfidence: session.taskCategoryConfidence,
      title: session.title,
      tokenCachedInput: session.tokens.cachedInput,
      tokenCachedWrite: session.tokens.cachedWrite,
      tokenInput: session.tokens.input,
      tokenOutput: session.tokens.output,
      tokenReasoning: session.tokens.reasoning,
      tokenTotal: session.tokens.total,
      toolCallCount: session.toolCallCount,
      updatedAt: now,
      wasteScore: session.wasteScore,
      createdAt: now,
      // Success analysis fields
      completionState: sa.completionState,
      verificationState: sa.verificationState,
      successScore: sa.successScore,
      executionQualityScore: sa.executionQualityScore,
      reworkScore: sa.reworkScore,
      valueDensityScore: sa.valueDensityScore,
      analysisConfidence: sa.analysisConfidence,
      successSignalsJson: JSON.stringify(sa.successSignals),
    });

    this.replaceSessionFlags(session.id, session.flags);
    this.replaceScoreFactors(session.id, session.explanation.scoreFactors);
    this.replaceExplanations(
      session.id,
      session.explanation.outcomeReasons,
      session.explanation.wasteReasons,
    );
  }

  public getProviderSummaries(): SessionSummary[] {
    const rows = this.database.prepare(`
      SELECT
        provider,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_total), 0) AS totalTokens,
        COALESCE(SUM(cost_total_usd), 0) AS totalCostUsd,
        AVG(efficiency_score) AS averageEfficiency,
        SUM(CASE WHEN pricing_snapshot_id IS NOT NULL THEN 1 ELSE 0 END) AS pricedSessions,
        SUM(CASE WHEN pricing_snapshot_id IS NULL THEN 1 ELSE 0 END) AS unpricedSessions,
        MAX(reset_window_kind) AS resetWindowKind,
        MAX(reset_window_resets_at) AS resetWindowResetsAt,
        MAX(reset_window_remaining_percent) AS resetWindowRemainingPercent,
        AVG(success_score) AS averageSuccessScore,
        AVG(analysis_confidence) AS averageAnalysisConfidence
      FROM sessions
      GROUP BY provider
      ORDER BY totalTokens DESC
    `).all() as unknown as SessionSummary[];

    return rows;
  }

  public getSessionCount(): number {
    const row = this.database.prepare(`
      SELECT COUNT(*) AS count
      FROM sessions
    `).get() as { count: number };

    return row.count;
  }

  public listSessions(filters: SessionListFilters = {}): StoredSessionListItem[] {
    const clauses: string[] = [];
    const values: Array<string | number> = [];

    if (filters.provider) {
      clauses.push('provider = ?');
      values.push(filters.provider);
    }

    if (filters.model) {
      clauses.push('model = ?');
      values.push(filters.model);
    }

    if (filters.priced && !filters.unpriced) {
      clauses.push('pricing_snapshot_id IS NOT NULL');
    }

    if (filters.unpriced && !filters.priced) {
      clauses.push('pricing_snapshot_id IS NULL');
    }

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      clauses.push('(title LIKE ? OR provider_session_id LIKE ? OR model LIKE ?)');
      values.push(pattern, pattern, pattern);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 20));
    const page = Math.max(1, filters.page ?? 1);
    const offset = (page - 1) * pageSize;

    const rows = this.database.prepare(`
      SELECT
        id,
        provider,
        provider_session_id AS providerSessionId,
        started_at AS startedAt,
        model,
        token_total AS tokenTotal,
        cost_total_usd AS costTotalUsd,
        pricing_snapshot_id AS pricingSnapshotId,
        efficiency_score AS efficiencyScore,
        outcome,
        title,
        completion_state AS completionState,
        verification_state AS verificationState,
        success_score AS successScore,
        analysis_confidence AS analysisConfidence
      ORDER BY started_at DESC
      LIMIT ? OFFSET ?
    `).all(...values, pageSize, offset) as unknown as StoredSessionListItem[];

    return rows;
  }

  public listSessionsWithCount(filters: SessionListFilters = {}): SessionListResult {
    const clauses: string[] = [];
    const values: Array<string | number> = [];

    if (filters.provider) {
      clauses.push('provider = ?');
      values.push(filters.provider);
    }

    if (filters.model) {
      clauses.push('model = ?');
      values.push(filters.model);
    }

    if (filters.priced && !filters.unpriced) {
      clauses.push('pricing_snapshot_id IS NOT NULL');
    }

    if (filters.unpriced && !filters.priced) {
      clauses.push('pricing_snapshot_id IS NULL');
    }

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      clauses.push('(title LIKE ? OR provider_session_id LIKE ? OR model LIKE ?)');
      values.push(pattern, pattern, pattern);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 20));
    const page = Math.max(1, filters.page ?? 1);
    const offset = (page - 1) * pageSize;

    const countRow = this.database.prepare(`
      SELECT COUNT(*) AS total FROM sessions ${whereClause}
    `).get(...values) as { total: number };

    const rows = this.database.prepare(`
      SELECT
        id,
        provider,
        provider_session_id AS providerSessionId,
        started_at AS startedAt,
        model,
        token_total AS tokenTotal,
        cost_total_usd AS costTotalUsd,
        pricing_snapshot_id AS pricingSnapshotId,
        efficiency_score AS efficiencyScore,
        outcome,
        title,
        completion_state AS completionState,
        verification_state AS verificationState,
        success_score AS successScore,
        analysis_confidence AS analysisConfidence
        analysis_confidence AS analysisConfidence
      FROM sessions
      ${whereClause}
      ORDER BY started_at DESC
      LIMIT ? OFFSET ?
    `).all(...values, pageSize, offset) as unknown as StoredSessionListItem[];

    const totalPages = Math.max(1, Math.ceil(countRow.total / pageSize));

    return {
      sessions: rows,
      total: countRow.total,
      page,
      pageSize,
      totalPages,
    };
  }

  public getSessionDetail(sessionId: string): StoredSessionDetail | null {
    const row = this.database.prepare(`
      SELECT
        id,
        provider,
        provider_session_id AS providerSessionId,
        source_path AS sourcePath,
        project_path AS projectPath,
        started_at AS startedAt,
        ended_at AS endedAt,
        duration_ms AS durationMs,
        model,
        token_total AS tokenTotal,
        token_input AS tokenInput,
        token_output AS tokenOutput,
        token_cached_input AS tokenCachedInput,
        token_reasoning AS tokenReasoning,
        cost_input_usd AS costInputUsd,
        cost_output_usd AS costOutputUsd,
        cost_cache_read_usd AS costCacheReadUsd,
        cost_cache_write_usd AS costCacheWriteUsd,
        cost_total_usd AS costTotalUsd,
        pricing_snapshot_id AS pricingSnapshotId,
        cache_hit_rate AS cacheHitRate,
        efficiency_score AS efficiencyScore,
        outcome,
        outcome_confidence AS outcomeConfidence,
        task_category AS taskCategory,
        task_category_confidence AS taskCategoryConfidence,
        waste_score AS wasteScore,
        anomaly_score AS anomalyScore,
        loop_count AS loopCount,
        title,
        completion_state AS completionState,
        verification_state AS verificationState,
        success_score AS successScore,
        analysis_confidence AS analysisConfidence,
        execution_quality_score AS executionQualityScore,
        rework_score AS reworkScore,
        value_density_score AS valueDensityScore,
        success_signals_json AS successSignalsJson
      FROM sessions
      WHERE id = ? OR provider_session_id = ?
      LIMIT 1
    `).get(sessionId, sessionId) as (StoredSessionDetail & { successSignalsJson: string; executionQualityScore: number | null; reworkScore: number | null; valueDensityScore: number | null }) | undefined;

    if (!row) {
      return null;
    }

    const explanations = this.database.prepare(`
      SELECT outcome_reasons_json, waste_reasons_json
      FROM session_explanations
      WHERE session_id = ?
    `).get(row.id) as
      | { outcome_reasons_json: string; waste_reasons_json: string }
      | undefined;

    const scoreFactors = this.database.prepare(`
      SELECT factor_key AS key, label, impact, direction
      FROM session_score_factors
      WHERE session_id = ?
      ORDER BY impact DESC
    `).all(row.id) as Array<{
      key: string;
      label: string;
      impact: number;
      direction: 'positive' | 'negative' | 'neutral';
    }>;

    let successSignals: Array<{ kind: string; direction: string; weight: number; confidence: number; label: string; evidence: string }> = [];
    try {
      successSignals = JSON.parse(row.successSignalsJson || '[]');
    } catch {
      // Ignore parse errors
    }

    return {
      ...row,
      outcomeReasons: explanations ? parseStringArray(explanations.outcome_reasons_json) : [],
      wasteReasons: explanations ? parseStringArray(explanations.waste_reasons_json) : [],
      scoreFactors,
      successAnalysis: {
        completionState: row.completionState as 'completed' | 'partial' | 'abandoned' | 'reverted' | 'unknown',
        verificationState: row.verificationState as 'verified' | 'probable' | 'contradicted' | 'missing',
        successScore: row.successScore,
        executionQualityScore: row.executionQualityScore,
        reworkScore: row.reworkScore,
        valueDensityScore: row.valueDensityScore,
        analysisConfidence: row.analysisConfidence,
        successSignals: successSignals as unknown as import('../domain/session.js').SuccessSignal[],
      },
    };
  }

  public getProviderHealth(provider: string): ProviderHealthRecord | null {
    const row = this.database.prepare(`
      SELECT
        provider,
        status,
        last_successful_import_at AS lastSuccessfulImportAt,
        last_checked_at AS lastCheckedAt,
        sources_found AS sourcesFound,
        issues_json AS issuesJson
      FROM provider_health
      WHERE provider = ?
      LIMIT 1
    `).get(provider) as
      | {
          provider: string;
          status: ProviderHealthRecord['status'];
          lastSuccessfulImportAt: string | null;
          lastCheckedAt: string;
          sourcesFound: number;
          issuesJson: string;
        }
      | undefined;

    return row ? mapProviderHealthRow(row) : null;
  }

  public listProviderHealth(): ProviderHealthRecord[] {
    const rows = this.database.prepare(`
      SELECT
        provider,
        status,
        last_successful_import_at AS lastSuccessfulImportAt,
        last_checked_at AS lastCheckedAt,
        sources_found AS sourcesFound,
        issues_json AS issuesJson
      FROM provider_health
      ORDER BY provider ASC
    `).all() as Array<{
      provider: string;
      status: ProviderHealthRecord['status'];
      lastSuccessfulImportAt: string | null;
      lastCheckedAt: string;
      sourcesFound: number;
      issuesJson: string;
    }>;

    return rows.map((row) => mapProviderHealthRow(row));
  }

  public getModelOptions(): ModelOption[] {
    const rows = this.database.prepare(`
      SELECT
        COALESCE(model, 'unknown') AS model,
        COUNT(*) AS sessionCount
      FROM sessions
      GROUP BY model
      ORDER BY sessionCount DESC
    `).all() as Array<{
      model: string;
      sessionCount: number;
    }>;

    return rows.map((row) => ({
      model: row.model,
      sessionCount: row.sessionCount,
    }));
  }

  public getModelSummaries(): ModelSummary[] {
    const rows = this.database.prepare(`
      SELECT
        COALESCE(model, 'unknown') AS model,
        provider,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_total), 0) AS totalTokens,
        COALESCE(SUM(cost_total_usd), 0) AS totalCostUsd,
        AVG(efficiency_score) AS averageEfficiency,
        SUM(CASE WHEN pricing_snapshot_id IS NOT NULL THEN 1 ELSE 0 END) AS pricedSessions
      FROM sessions
      GROUP BY model, provider
      ORDER BY totalTokens DESC
    `).all() as unknown as ModelSummary[];

    return rows;
  }

  public getDailyBuckets(days = 30): DailyBucket[] {
    const rows = this.database.prepare(`
      SELECT
        DATE(started_at) AS date,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_total), 0) AS totalTokens,
        COALESCE(SUM(cost_total_usd), 0) AS totalCostUsd,
        AVG(efficiency_score) AS averageEfficiency
      FROM sessions
      WHERE started_at >= date('now', ?)
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `).all(`-${days} days`) as unknown as DailyBucket[];

    return rows;
  }


  public getSessionCountForWindow(days: number): number {
    const row = this.database.prepare(`
      SELECT COUNT(*) AS count
      FROM sessions
      WHERE started_at >= date('now', ?)
    `).get(`-${days} days`) as { count: number };

    return row.count;
  }

  public getProviderSummariesForWindow(days: number): SessionSummary[] {
    const rows = this.database.prepare(`
      SELECT
        provider,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_total), 0) AS totalTokens,
        COALESCE(SUM(cost_total_usd), 0) AS totalCostUsd,
        AVG(efficiency_score) AS averageEfficiency,
        SUM(CASE WHEN pricing_snapshot_id IS NOT NULL THEN 1 ELSE 0 END) AS pricedSessions,
        SUM(CASE WHEN pricing_snapshot_id IS NULL THEN 1 ELSE 0 END) AS unpricedSessions,
        MAX(reset_window_kind) AS resetWindowKind,
        MAX(reset_window_resets_at) AS resetWindowResetsAt,
        MAX(reset_window_remaining_percent) AS resetWindowRemainingPercent,
        AVG(success_score) AS averageSuccessScore,
        AVG(analysis_confidence) AS averageAnalysisConfidence
      FROM sessions
      WHERE started_at >= date('now', ?)
      GROUP BY provider
      ORDER BY totalTokens DESC
    `).all(`-${days} days`) as unknown as SessionSummary[];

    return rows;
  }

  public getModelSummariesForWindow(days: number): ModelSummary[] {
    const rows = this.database.prepare(`
      SELECT
        COALESCE(model, 'unknown') AS model,
        provider,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_total), 0) AS totalTokens,
        COALESCE(SUM(cost_total_usd), 0) AS totalCostUsd,
        AVG(efficiency_score) AS averageEfficiency,
        SUM(CASE WHEN pricing_snapshot_id IS NOT NULL THEN 1 ELSE 0 END) AS pricedSessions
      FROM sessions
      WHERE started_at >= date('now', ?)
      GROUP BY model, provider
      ORDER BY totalTokens DESC
    `).all(`-${days} days`) as unknown as ModelSummary[];

    return rows;
  }

  public listSessionsForWindow(days: number, limit = 50): StoredSessionListItem[] {
    return this.database.prepare(`
      SELECT
        id,
        provider,
        provider_session_id AS providerSessionId,
        started_at AS startedAt,
        model,
        token_total AS tokenTotal,
        cost_total_usd AS costTotalUsd,
        pricing_snapshot_id AS pricingSnapshotId,
        efficiency_score AS efficiencyScore,
        outcome,
        title,
        completion_state AS completionState,
        verification_state AS verificationState,
        success_score AS successScore,
        analysis_confidence AS analysisConfidence
      FROM sessions
      WHERE started_at >= date('now', ?)
      ORDER BY started_at DESC
      LIMIT ?
    `).all(`-${days} days`, limit) as unknown as StoredSessionListItem[];
  }
  private replaceSessionFlags(sessionId: string, flags: string[]): void {
    this.database.prepare('DELETE FROM session_flags WHERE session_id = ?').run(sessionId);
    const insert = this.database.prepare(`
      INSERT INTO session_flags (session_id, flag)
      VALUES (?, ?)
    `);

    for (const flag of flags) {
      insert.run(sessionId, flag);
    }
  }

  private replaceScoreFactors(sessionId: string, factors: ScoreFactor[]): void {
    this.database.prepare('DELETE FROM session_score_factors WHERE session_id = ?').run(sessionId);
    const insert = this.database.prepare(`
      INSERT INTO session_score_factors (session_id, factor_key, label, impact, direction)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const factor of factors) {
      insert.run(sessionId, factor.key, factor.label, factor.impact, factor.direction);
    }
  }

  private replaceExplanations(
    sessionId: string,
    outcomeReasons: string[],
    wasteReasons: string[],
  ): void {
    this.database.prepare(`
      INSERT INTO session_explanations (session_id, outcome_reasons_json, waste_reasons_json)
      VALUES (?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        outcome_reasons_json = excluded.outcome_reasons_json,
        waste_reasons_json = excluded.waste_reasons_json
    `).run(sessionId, JSON.stringify(outcomeReasons), JSON.stringify(wasteReasons));
  }
}

function mapProviderHealthRow(row: {
  provider: string;
  status: ProviderHealthRecord['status'];
  lastSuccessfulImportAt: string | null;
  lastCheckedAt: string;
  sourcesFound: number;
  issuesJson: string;
}): ProviderHealthRecord {
  return {
    provider: row.provider,
    status: row.status,
    lastSuccessfulImportAt: row.lastSuccessfulImportAt,
    lastCheckedAt: row.lastCheckedAt,
    sourcesFound: row.sourcesFound,
    issues: parseIssues(row.issuesJson),
  };
}

function parseIssues(issuesJson: string): string[] {
  try {
    const parsed = JSON.parse(issuesJson) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

function parseStringArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export function defaultDatabasePath(): string {
  return process.env.TTM_DB_PATH ?? join(process.cwd(), '.ttm', 'ttm.sqlite');
}
