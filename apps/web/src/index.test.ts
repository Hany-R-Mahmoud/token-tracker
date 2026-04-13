import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { computeCompositeScore, computeLeaderboardSnapshot, MINIMUM_PARTICIPATION_THRESHOLD } from './scoring.js';
import type { SessionData } from './scoring.js';
import { LeaderboardDatabase } from './db.js';
import { syncLocalSessions } from './ingestion.js';
import { createApp } from './index.js';
import { TtmDatabase } from '@ttm/core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..', '..');

function tempDbPath(name: string): string {
  const dir = join(tmpdir(), 'ttm-web-tests', `${name}-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return join(dir, 'test.sqlite');
}

function createTempLocalDb(sessionCount: number): { db: TtmDatabase; path: string } {
  const path = tempDbPath(`local-${sessionCount}`);
  const db = new TtmDatabase(path);

  const now = new Date();
  for (let i = 0; i < sessionCount; i++) {
    const startedAt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).database.prepare(`
      INSERT INTO sessions (id, provider, provider_session_id, source_path, started_at, last_activity_at, model,
        token_input, token_output, token_total, cost_input_usd, cost_output_usd, cost_total_usd,
        efficiency_score, waste_score, cache_hit_rate, outcome, outcome_confidence,
        task_category, parser_version, contains_sensitive_text, created_at, updated_at)
      VALUES (?, 'codex', ?, '/tmp/test', ?, ?, 'gpt-5',
        1000, 500, 1500, 0.5, 0.3, 0.8,
        50, 0.2, 0.3, 'success', 0.8,
        'unknown', '0.1.0', 0, ?, ?)
    `).run(`session-${i}`, `provider-${i}`, startedAt, startedAt, startedAt, startedAt);
  }

  return { db, path };
}

async function runAppRequest(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
  method: string,
  path: string,
  headers: Record<string, string> = {},
): Promise<{ statusCode: number; body: string; headers: Record<string, string | string[]> }> {
  const normalizedHeaders = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  const req = new EventEmitter() as IncomingMessage & EventEmitter;
  req.method = method;
  req.url = path;
  req.headers = normalizedHeaders;

  return await new Promise((resolve) => {
    const responseHeaders: Record<string, string | string[]> = {};
    let statusCode = 200;
    let body = '';

    const res = {
      setHeader(name: string, value: string | string[]): void {
        responseHeaders[name] = value;
      },
      writeHead(code: number, headers?: Record<string, string | string[]>): ServerResponse {
        statusCode = code;
        if (headers) {
          Object.assign(responseHeaders, headers);
        }
        return this as unknown as ServerResponse;
      },
      end(chunk?: string | Buffer): ServerResponse {
        if (typeof chunk === 'string') {
          body += chunk;
        } else if (chunk instanceof Buffer) {
          body += chunk.toString();
        }
        resolve({ statusCode, body, headers: responseHeaders });
        return this as unknown as ServerResponse;
      },
    } as ServerResponse;

    handler(req, res);
    if (method === 'POST') {
      req.emit('end');
    }
  });
}

function findSetCookie(headers: IncomingMessage['headers'], prefix: string): string | undefined {
  const setCookie = headers['set-cookie'];
  if (!setCookie) {
    return undefined;
  }

  return setCookie.find((value) => value.startsWith(prefix));
}

function toSetCookieArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function extractCookieValue(cookie: string | undefined, name: string): string | null {
  if (!cookie) {
    return null;
  }

  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

describe('scoring', () => {
  it('rejects users with fewer than 3 sessions (minimum participation threshold)', () => {
    const data: SessionData = {
      userId: '1',
      sessionCount: 2,
      totalTokens: 1000,
      totalCostUsd: 1.0,
      averageEfficiency: 0.8,
      averageCacheHitRate: 0.5,
      averageWasteScore: 0.1,
      outcomeSuccessRate: 0.9,
    };
    const result = computeCompositeScore(data);
    assert.strictEqual(result, null, 'Should return null for users below minimum threshold');
    assert.strictEqual(MINIMUM_PARTICIPATION_THRESHOLD, 3);
  });

  it('accepts users with exactly 3 sessions', () => {
    const data: SessionData = {
      userId: '1',
      sessionCount: 3,
      totalTokens: 1000,
      totalCostUsd: 1.0,
      averageEfficiency: 0.8,
      averageCacheHitRate: 0.5,
      averageWasteScore: 0.1,
      outcomeSuccessRate: 0.9,
    };
    const result = computeCompositeScore(data);
    assert.ok(result !== null, 'Should return a score for users at minimum threshold');
  });

  it('ranks by efficiency score descending, then session count descending', () => {
    const sessions: SessionData[] = [
      { userId: '1', sessionCount: 5, totalTokens: 5000, totalCostUsd: 5.0, averageEfficiency: 0.8, averageCacheHitRate: 0.5, averageWasteScore: 0.1, outcomeSuccessRate: 0.9 },
      { userId: '2', sessionCount: 10, totalTokens: 10000, totalCostUsd: 10.0, averageEfficiency: 0.8, averageCacheHitRate: 0.5, averageWasteScore: 0.1, outcomeSuccessRate: 0.9 },
      { userId: '3', sessionCount: 5, totalTokens: 5000, totalCostUsd: 5.0, averageEfficiency: 0.9, averageCacheHitRate: 0.5, averageWasteScore: 0.1, outcomeSuccessRate: 0.9 },
    ];

    const users = sessions.map((s) => ({
      userId: s.userId,
      githubId: Number(s.userId),
      username: `user_${s.userId}`,
      displayName: null,
      avatarUrl: null,
    }));

    const entries = computeLeaderboardSnapshot(sessions, users);

    assert.strictEqual(entries.length, 3);
    assert.strictEqual(entries[0].rank, 1);
    assert.strictEqual(entries[0].userId, '3', 'Highest efficiency should be rank 1');
    assert.strictEqual(entries[1].rank, 2);
    assert.strictEqual(entries[1].userId, '2', 'Same efficiency but more sessions should be rank 2');
    assert.strictEqual(entries[2].rank, 3);
    assert.strictEqual(entries[2].userId, '1', 'Same efficiency but fewer sessions should be rank 3');
  });
});

describe('database period-aware queries', () => {
  let db: LeaderboardDatabase;
  let dbPath: string;

  beforeEach(() => {
    dbPath = tempDbPath('period-db');
    db = new LeaderboardDatabase(dbPath);
    db.createTeam('test-team', 'Test Team');
    db.upsertGitHubUser({ githubId: 12345, username: 'testuser', displayName: 'Test User', avatarUrl: null, email: null, accessToken: '' });
    db.setMembership(12345, 'test-team', true);
  });

  afterEach(() => {
    dbPath = dbPath.replace('test.sqlite', '');
    try { rmSync(dbPath, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('getUserSessions(windowDays) returns correctly filtered rows', () => {
    const now = new Date();
    const recentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
    const oldDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days ago

    db.upsertSession({ sessionId: 'recent', githubId: 12345, teamId: 'test-team', provider: 'codex', startedAt: recentDate, endedAt: null, model: 'gpt-5', tokenTotal: 1000, costTotalUsd: 1.0, efficiencyScore: 50, wasteScore: 0.2, cacheHitRate: 0.3, outcome: 'success', outcomeConfidence: 0.8, completionState: null, verificationState: null, successScore: null, executionQualityScore: null, reworkScore: null, valueDensityScore: null, analysisConfidence: null });
    db.upsertSession({ sessionId: 'old', githubId: 12345, teamId: 'test-team', provider: 'codex', startedAt: oldDate, endedAt: null, model: 'gpt-5', tokenTotal: 2000, costTotalUsd: 2.0, efficiencyScore: 60, wasteScore: 0.3, cacheHitRate: 0.4, outcome: 'success', outcomeConfidence: 0.9, completionState: null, verificationState: null, successScore: null, executionQualityScore: null, reworkScore: null, valueDensityScore: null, analysisConfidence: null });

    const weekSessions = db.getUserSessions(12345, 'test-team', 7);
    const monthSessions = db.getUserSessions(12345, 'test-team', 30);
    const allSessions = db.getUserSessions(12345, 'test-team', 0);

    assert.strictEqual(weekSessions.length, 1, 'Should return only recent session for 7-day window');
    assert.strictEqual(weekSessions[0].sessionId, 'recent');
    assert.strictEqual(monthSessions.length, 1, 'Should return only recent session for 30-day window');
    assert.strictEqual(allSessions.length, 2, 'Should return all sessions for all-time window');
  });

  it('getSnapshot(teamId, windowDays) returns the correct snapshot', () => {
    db.saveSnapshot('snap-week', 'test-team', 7, JSON.stringify([{ rank: 1, userId: '1', githubId: 12345, username: 'user1', displayName: null, avatarUrl: null, efficiencyScore: 50, sessionCount: 5, totalTokens: 5000, totalCostUsd: 5.0, averageCacheHitRate: 0.5, wasteScore: 0.1, outcomeSuccessRate: 0.9 }]));
    db.saveSnapshot('snap-month', 'test-team', 30, JSON.stringify([{ rank: 1, userId: '1', githubId: 12345, username: 'user1', displayName: null, avatarUrl: null, efficiencyScore: 60, sessionCount: 10, totalTokens: 10000, totalCostUsd: 10.0, averageCacheHitRate: 0.5, wasteScore: 0.1, outcomeSuccessRate: 0.9 }]));

    const weekSnapshot = db.getSnapshot('test-team', 7);
    const monthSnapshot = db.getSnapshot('test-team', 30);
    const nullSnapshot = db.getSnapshot('test-team', 3650);

    assert.ok(weekSnapshot !== null, 'Should return week snapshot');
    assert.strictEqual(weekSnapshot?.windowDays, 7);
    assert.strictEqual(weekSnapshot?.snapshotId, 'snap-week');

    assert.ok(monthSnapshot !== null, 'Should return month snapshot');
    assert.strictEqual(monthSnapshot?.windowDays, 30);
    assert.strictEqual(monthSnapshot?.snapshotId, 'snap-month');

    assert.strictEqual(nullSnapshot, null, 'Should return null for non-existent window');
  });
});

describe('real ingestion via syncLocalSessions', () => {
  let leaderboardDb: LeaderboardDatabase;
  let leaderboardDbPath: string;
  let localDb: TtmDatabase;
  let localDbPath: string;

  beforeEach(() => {
    leaderboardDbPath = tempDbPath('ingestion-lb');
    leaderboardDb = new LeaderboardDatabase(leaderboardDbPath);
    leaderboardDb.createTeam('test-team', 'Test Team');
    leaderboardDb.upsertGitHubUser({ githubId: 12345, username: 'testuser', displayName: 'Test User', avatarUrl: null, email: null, accessToken: '' });

    // Create a local DB with test sessions
    const result = createTempLocalDb(10);
    localDb = result.db;
    localDbPath = result.path;
  });

  afterEach(() => {
    leaderboardDbPath = leaderboardDbPath.replace('test.sqlite', '');
    try { rmSync(leaderboardDbPath, { recursive: true, force: true }); } catch { /* ignore */ }
    localDbPath = localDbPath.replace('test.sqlite', '');
    try { rmSync(localDbPath, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('syncLocalSessions ingests expected fields and excludes sensitive ones', () => {
    const result = syncLocalSessions(leaderboardDb, 12345, 'test-team', 30, localDb);

    assert.ok(result.syncedSessions > 0, 'Should ingest at least some sessions');

    // Verify ingested session fields
    const sessions = leaderboardDb.getUserSessions(12345, 'test-team', 0);
    assert.ok(sessions.length > 0, 'Should have ingested sessions');

    const session = sessions[0];
    const keys = Object.keys(session);

    // Verify expected fields are present
    assert.ok(keys.includes('sessionId'), 'Should have sessionId');
    assert.ok(keys.includes('tokenTotal'), 'Should have tokenTotal');
    assert.ok(keys.includes('costTotalUsd'), 'Should have costTotalUsd');
    assert.ok(keys.includes('efficiencyScore'), 'Should have efficiencyScore');
    assert.ok(keys.includes('wasteScore'), 'Should have wasteScore');
    assert.ok(keys.includes('cacheHitRate'), 'Should have cacheHitRate');
    assert.ok(keys.includes('outcome'), 'Should have outcome');

    // Verify sensitive fields are NOT present
    const sensitiveFields = ['prompt', 'transcript', 'content', 'message', 'filePath', 'sourcePath', 'title', 'outcomeReasons', 'wasteReasons', 'scoreFactors'];
    for (const field of sensitiveFields) {
      assert.ok(!keys.includes(field), `Should NOT have sensitive field: ${field}`);
    }
  });

  it('syncLocalSessions can ingest more than 50 sessions end to end', () => {
    // Create a local DB with 100 sessions
    const result = createTempLocalDb(100);
    const largeLocalDb = result.db;
    const largeLocalDbPath = result.path;

    const syncResult = syncLocalSessions(leaderboardDb, 12345, 'test-team', 3650, largeLocalDb);

    assert.ok(syncResult.syncedSessions >= 100, `Should ingest at least 100 sessions (got ${syncResult.syncedSessions})`);

    // Verify all sessions are in the leaderboard DB
    const sessions = leaderboardDb.getUserSessions(12345, 'test-team', 0);
    assert.ok(sessions.length >= 100, `Leaderboard DB should have at least 100 sessions (got ${sessions.length})`);

    // Cleanup
    try { rmSync(largeLocalDbPath.replace('test.sqlite', ''), { recursive: true, force: true }); } catch { /* ignore */ }
  });
});

describe('real app HTTP endpoints', () => {
  let db: LeaderboardDatabase;
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  function setupApp(adminApiKey?: string): void {
    dbPath = tempDbPath('http-db');
    db = new LeaderboardDatabase(dbPath);
    db.createTeam('default-team', 'Default Team');
    db.upsertGitHubUser({ githubId: 12345, username: 'testuser', displayName: 'Test User', avatarUrl: null, email: null, accessToken: '' });
    db.upsertGitHubUser({
      githubId: 67890,
      username: `o'brien<&quot;user>`,
      displayName: `Display "Quoted" O'Brien <Admin> & &#39;`,
      avatarUrl: null,
      email: null,
      accessToken: '',
    });
    db.setMembership(12345, 'default-team', true);
    db.setMembership(67890, 'default-team', true);

    // Add some sessions
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const startedAt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
      db.upsertSession({
        sessionId: `session-${i}`,
        githubId: 12345,
        teamId: 'default-team',
        provider: 'codex',
        startedAt,
        endedAt: null,
        model: 'gpt-5',
        tokenTotal: 1000 * (i + 1),
        costTotalUsd: 1.0 * (i + 1),
        efficiencyScore: 50 + i * 5,
        wasteScore: 0.2,
        cacheHitRate: 0.3,
        outcome: 'success',
        outcomeConfidence: 0.8,
        completionState: null,
        verificationState: null,
        successScore: null,
        executionQualityScore: null,
        reworkScore: null,
        valueDensityScore: null,
        analysisConfidence: null,
      });
      db.upsertSession({
        sessionId: `special-session-${i}`,
        githubId: 67890,
        teamId: 'default-team',
        provider: 'codex',
        startedAt,
        endedAt: null,
        model: 'gpt-5',
        tokenTotal: 2000 * (i + 1),
        costTotalUsd: 2.0 * (i + 1),
        efficiencyScore: 60 + i * 5,
        wasteScore: 0.1,
        cacheHitRate: 0.4,
        outcome: 'success',
        outcomeConfidence: 0.9,
        completionState: null,
        verificationState: null,
        successScore: null,
        executionQualityScore: null,
        reworkScore: null,
        valueDensityScore: null,
        analysisConfidence: null,
      });
    }

    app = createApp(db, null, {
      adminApiKey: adminApiKey ?? '',
    });
  }

  afterEach(() => {
    dbPath = dbPath.replace('test.sqlite', '');
    try { rmSync(dbPath, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  describe('/api/leaderboard period handling', () => {
    beforeEach(() => setupApp());

    it('returns the snapshot matching the requested period (week)', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/api/leaderboard?period=week');
      assert.strictEqual(statusCode, 200);
      const data = JSON.parse(body);
      assert.strictEqual(data.period, 'week');
      assert.strictEqual(data.windowDays, 7);
      assert.strictEqual(data.snapshot?.windowDays, 7, 'Snapshot should match requested period');
    });

    it('returns the snapshot matching the requested period (month)', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/api/leaderboard?period=month');
      assert.strictEqual(statusCode, 200);
      const data = JSON.parse(body);
      assert.strictEqual(data.period, 'month');
      assert.strictEqual(data.windowDays, 30);
      assert.strictEqual(data.snapshot?.windowDays, 30, 'Snapshot should match requested period');
    });

    it('returns the snapshot matching the requested period (all_time)', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/api/leaderboard?period=all_time');
      assert.strictEqual(statusCode, 200);
      const data = JSON.parse(body);
      assert.strictEqual(data.period, 'all_time');
      assert.strictEqual(data.windowDays, 3650);
      assert.strictEqual(data.snapshot?.windowDays, 3650, 'Snapshot should match requested period');
    });
  });

  describe('/leaderboard drawer payload hardening', () => {
    beforeEach(() => setupApp());

    it('base64-encodes member payloads so special characters round-trip safely', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/leaderboard');
      assert.strictEqual(statusCode, 200);

      const matches = [...body.matchAll(/data-member-b64="([^"]+)"/g)];
      assert.ok(matches.length >= 2, 'Should render encoded member payloads');

      const decodedPayloads = matches.map((match) => JSON.parse(Buffer.from(match[1], 'base64').toString('utf8')) as {
        displayName: string;
        username: string;
      });

      const specialPayload = decodedPayloads.find((payload) => payload.username === `o'brien<&quot;user>`);
      assert.ok(specialPayload, 'Should preserve the special-character username');
      assert.strictEqual(specialPayload?.displayName, `Display "Quoted" O'Brien <Admin> & &#39;`);
      assert.ok(!body.includes('data-member='), 'Should no longer embed raw JSON in HTML attributes');
    });

    it('renders drawer content through text nodes instead of innerHTML', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/leaderboard');
      assert.strictEqual(statusCode, 200);
      assert.ok(body.includes('function decodeMemberPayload(encoded) {'));
      assert.ok(body.includes('document.createElement(\'div\')'));
      assert.ok(body.includes('value.textContent = r.value'));
      assert.ok(!body.includes('innerHTML'));
    });

    it('does not expose raw session identifiers or source paths in the leaderboard HTML', async () => {
      const { statusCode, body } = await runAppRequest(app, 'GET', '/leaderboard');
      assert.strictEqual(statusCode, 200);
      assert.ok(!body.includes('session-0'));
      assert.ok(!body.includes('special-session-0'));
      assert.ok(!body.includes('source_path'));
      assert.ok(!body.includes('file_path'));
      assert.ok(!body.includes('/tmp/test'));
    });
  });

  describe('/api/compute-snapshot admin protection', () => {
    beforeEach(() => setupApp('secret-key'));

    it('returns 403 when admin key is configured and header is missing', async () => {
      const { statusCode } = await runAppRequest(app, 'POST', '/api/compute-snapshot');
      assert.strictEqual(statusCode, 403, 'Should return 403 without admin key');
    });

    it('returns 403 when admin key is configured and header is wrong', async () => {
      const { statusCode } = await runAppRequest(app, 'POST', '/api/compute-snapshot', {
        Authorization: 'Bearer wrong-key',
      });
      assert.strictEqual(statusCode, 403, 'Should return 403 with wrong admin key');
    });

    it('succeeds when admin key matches', async () => {
      const { statusCode, body } = await runAppRequest(app, 'POST', '/api/compute-snapshot', {
        Authorization: 'Bearer secret-key',
      });
      assert.strictEqual(statusCode, 200, 'Should return 200 with correct admin key');
      const data = JSON.parse(body);
      assert.strictEqual(data.computed, true);
    });
  });

  describe('GitHub OAuth and session handling', () => {
    beforeEach(() => setupApp());

    it('redirects to GitHub OAuth when configured', async () => {
      app = createApp(db, null, {
        githubClientId: 'test-client-id',
        githubClientSecret: 'test-client-secret',
        webOrigin: 'http://127.0.0.1:3200',
        githubOAuthClient: {
          async exchangeCodeForToken(): Promise<string> {
            throw new Error('not used');
          },
          async fetchUser(): Promise<never> {
            throw new Error('not used');
          },
        },
      });
      const response = await runAppRequest(app, 'GET', '/auth/github');
      assert.strictEqual(response.statusCode, 302);
      assert.ok(typeof response.headers.Location === 'string' && response.headers.Location.startsWith('https://github.com/login/oauth/authorize?client_id=test-client-id'));
      assert.ok(findSetCookie({ 'set-cookie': toSetCookieArray(response.headers['Set-Cookie']) }, 'oauth_state='), 'Should set oauth_state cookie');
    });

    it('completes OAuth callback, persists user, and creates a real session', async () => {
      app = createApp(db, null, {
        githubClientId: 'test-client-id',
        githubClientSecret: 'test-client-secret',
        webOrigin: 'http://127.0.0.1:3200',
        githubOAuthClient: {
          async exchangeCodeForToken(code: string): Promise<string> {
            assert.strictEqual(code, 'test-code');
            return 'access-token';
          },
          async fetchUser(accessToken: string) {
            assert.strictEqual(accessToken, 'access-token');
            return {
              githubId: 777,
              username: 'octocat',
              displayName: 'The Octocat',
              avatarUrl: 'https://example.com/avatar.png',
              email: 'octocat@example.com',
            };
          },
        },
      });
      const startResponse = await runAppRequest(app, 'GET', '/auth/github');
      const stateCookie = findSetCookie({ 'set-cookie': toSetCookieArray(startResponse.headers['Set-Cookie']) }, 'oauth_state=');
      const oauthState = extractCookieValue(stateCookie, 'oauth_state');
      assert.ok(oauthState, 'OAuth start should set state cookie');

      const callbackResponse = await runAppRequest(app, 'GET', `/auth/github/callback?code=test-code&state=${oauthState}`, {
        Cookie: `oauth_state=${oauthState}`,
      });

      assert.strictEqual(callbackResponse.statusCode, 302);
      const sessionCookie = findSetCookie({ 'set-cookie': toSetCookieArray(callbackResponse.headers['Set-Cookie']) }, 'ttm_session=');
      assert.ok(sessionCookie, 'Callback should set a real session cookie');

      const sessionValue = extractCookieValue(sessionCookie, 'ttm_session');
      assert.ok(sessionValue, 'Session cookie should contain a session ID');

      const meResponse = await runAppRequest(app, 'GET', '/api/me', {
        Cookie: `ttm_session=${sessionValue}`,
      });
      const meData = JSON.parse(meResponse.body) as {
        connected: boolean;
        user: { githubId: number; username: string; displayName: string | null } | null;
      };

      assert.strictEqual(meData.connected, true);
      assert.strictEqual(meData.user?.githubId, 777);
      assert.strictEqual(meData.user?.username, 'octocat');
      assert.strictEqual(meData.user?.displayName, 'The Octocat');
    });

    it('rejects invalid OAuth state and clears nothing else', async () => {
      app = createApp(db, null, {
        githubClientId: 'test-client-id',
        githubClientSecret: 'test-client-secret',
        webOrigin: 'http://127.0.0.1:3200',
        githubOAuthClient: {
          async exchangeCodeForToken(): Promise<string> {
            throw new Error('not used');
          },
          async fetchUser(): Promise<never> {
            throw new Error('not used');
          },
        },
      });
      const response = await runAppRequest(app, 'GET', '/auth/github/callback?code=test-code&state=bad-state', {
        Cookie: 'oauth_state=expected-state',
      });

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body, 'Invalid state parameter');
    });

    it('disconnect clears the authenticated session safely', async () => {
      app = createApp(db, null, {
        githubClientId: 'test-client-id',
        githubClientSecret: 'test-client-secret',
        webOrigin: 'http://127.0.0.1:3200',
        githubOAuthClient: {
          async exchangeCodeForToken(): Promise<string> {
            return 'access-token';
          },
          async fetchUser() {
            return {
              githubId: 888,
              username: 'disconnect-user',
              displayName: 'Disconnect User',
              avatarUrl: null,
              email: 'disconnect@example.com',
            };
          },
        },
      });
      const startResponse = await runAppRequest(app, 'GET', '/auth/github');
      const oauthState = extractCookieValue(findSetCookie({ 'set-cookie': toSetCookieArray(startResponse.headers['Set-Cookie']) }, 'oauth_state='), 'oauth_state');
      const callbackResponse = await runAppRequest(app, 'GET', `/auth/github/callback?code=test-code&state=${oauthState}`, {
        Cookie: `oauth_state=${oauthState}`,
      });
      const sessionValue = extractCookieValue(findSetCookie({ 'set-cookie': toSetCookieArray(callbackResponse.headers['Set-Cookie']) }, 'ttm_session='), 'ttm_session');
      assert.ok(sessionValue);

      const disconnectResponse = await runAppRequest(app, 'POST', '/auth/disconnect', {
        Cookie: `ttm_session=${sessionValue}`,
      });
      assert.strictEqual(disconnectResponse.statusCode, 302);
      assert.ok(findSetCookie({ 'set-cookie': toSetCookieArray(disconnectResponse.headers['Set-Cookie']) }, 'ttm_session='), 'Disconnect should clear the session cookie');

      const meResponse = await runAppRequest(app, 'GET', '/api/me', {
        Cookie: `ttm_session=${sessionValue}`,
      });
      const meData = JSON.parse(meResponse.body) as { connected: boolean };
      assert.strictEqual(meData.connected, false);
    });
  });
});
