import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { TtmDatabase } from './database.js';
import { TtmReadService } from './read-service.js';

function createTempDbPath(): string {
  const dir = join(tmpdir(), 'ttm-core-tests', randomUUID());
  mkdirSync(dir, { recursive: true });
  return join(dir, 'test.sqlite');
}

function seedSession(db: TtmDatabase, sessionId: string, startedAt: string): void {
  (db as unknown as { database: { prepare: (sql: string) => { run: (...args: unknown[]) => void } } }).database.prepare(`
    INSERT INTO sessions (
      id, provider, provider_session_id, source_path, started_at, last_activity_at, model,
      token_input, token_output, token_total, cost_input_usd, cost_output_usd, cost_total_usd,
      efficiency_score, waste_score, cache_hit_rate, outcome, outcome_confidence,
      task_category, parser_version, contains_sensitive_text, created_at, updated_at
    ) VALUES (
      ?, 'codex', ?, '/tmp/test', ?, ?, 'gpt-5',
      1000, 500, 1500, 0.5, 0.3, 0.8,
      50, 0.2, 0.3, 'success', 0.8,
      'unknown', '0.1.0', 0, ?, ?
    )
  `).run(sessionId, `${sessionId}-provider`, startedAt, startedAt, startedAt, startedAt);
}

describe('TtmReadService window handling', () => {
  const tempPaths: string[] = [];

  afterEach(() => {
    while (tempPaths.length > 0) {
      const dbPath = tempPaths.pop();
      if (!dbPath) {
        continue;
      }

      try {
        rmSync(dbPath.replace('/test.sqlite', ''), { recursive: true, force: true });
      } catch {
        // best-effort temp cleanup
      }
    }
  });

  it('treats getAnalyticsSnapshot(days) as calendar days, not hours', () => {
    const dbPath = createTempDbPath();
    tempPaths.push(dbPath);

    const db = new TtmDatabase(dbPath);
    const readService = new TtmReadService(db);
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString();

    seedSession(db, 'recent-session', threeDaysAgo);
    seedSession(db, 'old-session', sixtyDaysAgo);

    const analytics = readService.getAnalyticsSnapshot(30);

    assert.strictEqual(analytics.sessionCount, 1);
    assert.strictEqual(analytics.recentSessions.length, 1);
    assert.strictEqual(analytics.recentSessions[0]?.id, 'recent-session');
  });
});
