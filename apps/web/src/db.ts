import { mkdirSync, chmodSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const LEADERBOARD_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS github_users (
    github_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    access_token TEXT,
    connected_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS teams (
    team_id TEXT PRIMARY KEY,
    team_name TEXT NOT NULL,
    default_window_days INTEGER NOT NULL DEFAULT 30,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS leaderboard_memberships (
    user_github_id INTEGER NOT NULL,
    team_id TEXT NOT NULL,
    opted_in INTEGER NOT NULL DEFAULT 0,
    opted_in_at TEXT,
    opted_out_at TEXT,
    PRIMARY KEY (user_github_id, team_id),
    FOREIGN KEY (user_github_id) REFERENCES github_users(github_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
  )`,
  `CREATE TABLE IF NOT EXISTS leaderboard_sessions (
    session_id TEXT PRIMARY KEY,
    user_github_id INTEGER NOT NULL,
    team_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    model TEXT,
    token_total INTEGER NOT NULL DEFAULT 0,
    cost_total_usd REAL NOT NULL DEFAULT 0,
    efficiency_score REAL,
    waste_score REAL,
    cache_hit_rate REAL,
    outcome TEXT,
    outcome_confidence REAL,
    completion_state TEXT,
    verification_state TEXT,
    success_score REAL,
    execution_quality_score REAL,
    rework_score REAL,
    value_density_score REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_github_id) REFERENCES github_users(github_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
  )`,
  `CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    window_days INTEGER NOT NULL,
    computed_at TEXT NOT NULL DEFAULT (datetime('now')),
    entries_json TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
  )`,
  `CREATE TABLE IF NOT EXISTS web_sessions (
    session_id TEXT PRIMARY KEY,
    github_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (github_id) REFERENCES github_users(github_id)
  )`,
];

export class LeaderboardDatabase {
  private readonly database: DatabaseSync;

  public constructor(databasePath: string) {
    mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec('PRAGMA foreign_keys = ON');
    this.database.exec(LEADERBOARD_SCHEMA_STATEMENTS.join(';\n'));
    
    // File permission hardening - restrict database file to owner only
    // This mitigates plaintext token exposure if the file is accessible to other users
    try {
      chmodSync(databasePath, 0o600);
    } catch {
      // Permission change may fail on some filesystems or Windows
      // This is best-effort; the main mitigation is that tokens shouldn't be stored plaintext
    }
  }

  public get path(): string {
    const result = this.database.prepare('PRAGMA database_list').all() as Array<{
      file: string;
    }>;
    return result[0]?.file ?? '';
  }

  // GitHub Identity
  public upsertGitHubUser(user: {
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    email: string | null;
    accessToken: string;
  }): void {
    this.database.prepare(`
      INSERT INTO github_users (github_id, username, display_name, avatar_url, email, access_token)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(github_id) DO UPDATE SET
        username = excluded.username,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        email = excluded.email,
        access_token = excluded.access_token,
        updated_at = datetime('now')
    `).run(user.githubId, user.username, user.displayName, user.avatarUrl, user.email, user.accessToken);
  }

  public getGitHubUser(githubId: number): {
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    email: string | null;
  } | null {
    const row = this.database.prepare(`
      SELECT github_id, username, display_name, avatar_url, email
      FROM github_users WHERE github_id = ?
    `).get(githubId) as {
      github_id: number;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      email: string | null;
    } | undefined;

    return row ? {
      githubId: row.github_id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      email: row.email,
    } : null;
  }

  public getGitHubUserByUsername(username: string): {
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null {
    const row = this.database.prepare(`
      SELECT github_id, username, display_name, avatar_url
      FROM github_users WHERE username = ?
    `).get(username) as {
      github_id: number;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    } | undefined;

    return row ? {
      githubId: row.github_id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    } : null;
  }

  public createWebSession(sessionId: string, githubId: number, expiresAt: string): void {
    this.database.prepare(`
      INSERT INTO web_sessions (session_id, github_id, expires_at)
      VALUES (?, ?, ?)
    `).run(sessionId, githubId, expiresAt);
  }

  public getWebSession(sessionId: string): {
    sessionId: string;
    githubId: number;
    expiresAt: string;
  } | null {
    const row = this.database.prepare(`
      SELECT session_id, github_id, expires_at
      FROM web_sessions
      WHERE session_id = ?
    `).get(sessionId) as {
      session_id: string;
      github_id: number;
      expires_at: string;
    } | undefined;

    if (!row) {
      return null;
    }

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      this.deleteWebSession(sessionId);
      return null;
    }

    this.touchWebSession(sessionId);

    return {
      sessionId: row.session_id,
      githubId: row.github_id,
      expiresAt: row.expires_at,
    };
  }

  public deleteWebSession(sessionId: string): void {
    this.database.prepare(`
      DELETE FROM web_sessions
      WHERE session_id = ?
    `).run(sessionId);
  }

  private touchWebSession(sessionId: string): void {
    this.database.prepare(`
      UPDATE web_sessions
      SET last_seen_at = datetime('now')
      WHERE session_id = ?
    `).run(sessionId);
  }

  // Teams
  public createTeam(teamId: string, teamName: string): void {
    this.database.prepare(`
      INSERT OR IGNORE INTO teams (team_id, team_name) VALUES (?, ?)
    `).run(teamId, teamName);
  }

  public getTeam(teamId: string): {
    teamId: string;
    teamName: string;
    defaultWindowDays: number;
  } | null {
    const row = this.database.prepare(`
      SELECT team_id, team_name, default_window_days
      FROM teams WHERE team_id = ?
    `).get(teamId) as {
      team_id: string;
      team_name: string;
      default_window_days: number;
    } | undefined;

    return row ? {
      teamId: row.team_id,
      teamName: row.team_name,
      defaultWindowDays: row.default_window_days,
    } : null;
  }

  public listTeams(): Array<{
    teamId: string;
    teamName: string;
    defaultWindowDays: number;
  }> {
    const rows = this.database.prepare(`
      SELECT team_id, team_name, default_window_days
      FROM teams ORDER BY team_name
    `).all() as Array<{
      team_id: string;
      team_name: string;
      default_window_days: number;
    }>;

    return rows.map((row) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      defaultWindowDays: row.default_window_days,
    }));
  }

  // Memberships
  public setMembership(githubId: number, teamId: string, optedIn: boolean): void {
    const now = new Date().toISOString();
    this.database.prepare(`
      INSERT INTO leaderboard_memberships (user_github_id, team_id, opted_in, opted_in_at, opted_out_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_github_id, team_id) DO UPDATE SET
        opted_in = excluded.opted_in,
        opted_in_at = CASE WHEN excluded.opted_in = 1 THEN excluded.opted_in_at ELSE opted_in_at END,
        opted_out_at = CASE WHEN excluded.opted_in = 0 THEN excluded.opted_out_at ELSE opted_out_at END
    `).run(githubId, teamId, optedIn ? 1 : 0, optedIn ? now : null, !optedIn ? now : null);
  }

  public getMembership(githubId: number, teamId: string): {
    optedIn: boolean;
    optedInAt: string | null;
    optedOutAt: string | null;
  } | null {
    const row = this.database.prepare(`
      SELECT opted_in, opted_in_at, opted_out_at
      FROM leaderboard_memberships
      WHERE user_github_id = ? AND team_id = ?
    `).get(githubId, teamId) as {
      opted_in: number;
      opted_in_at: string | null;
      opted_out_at: string | null;
    } | undefined;

    return row ? {
      optedIn: row.opted_in === 1,
      optedInAt: row.opted_in_at,
      optedOutAt: row.opted_out_at,
    } : null;
  }

  public getOptedInMembers(teamId: string): Array<{
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }> {
    const rows = this.database.prepare(`
      SELECT u.github_id, u.username, u.display_name, u.avatar_url
      FROM leaderboard_memberships m
      JOIN github_users u ON m.user_github_id = u.github_id
      WHERE m.team_id = ? AND m.opted_in = 1
      ORDER BY u.username
    `).all(teamId) as Array<{
      github_id: number;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    }>;

    return rows.map((row) => ({
      githubId: row.github_id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    }));
  }

  // Snapshots — period-aware
  public saveSnapshot(snapshotId: string, teamId: string, windowDays: number, entriesJson: string): void {
    this.database.prepare(`
      INSERT INTO leaderboard_snapshots (snapshot_id, team_id, window_days, entries_json)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(snapshot_id) DO UPDATE SET
        entries_json = excluded.entries_json,
        computed_at = datetime('now')
    `).run(snapshotId, teamId, windowDays, entriesJson);
  }

  /**
   * Get the most recent snapshot for a specific team and window.
   * This is period-safe: it only returns snapshots matching the exact window_days.
   */
  public getSnapshot(teamId: string, windowDays: number): {
    snapshotId: string;
    windowDays: number;
    computedAt: string;
    entriesJson: string;
  } | null {
    const row = this.database.prepare(`
      SELECT snapshot_id, window_days, computed_at, entries_json
      FROM leaderboard_snapshots
      WHERE team_id = ? AND window_days = ?
      ORDER BY computed_at DESC
      LIMIT 1
    `).get(teamId, windowDays) as {
      snapshot_id: string;
      window_days: number;
      computed_at: string;
      entries_json: string;
    } | undefined;

    return row ? {
      snapshotId: row.snapshot_id,
      windowDays: row.window_days,
      computedAt: row.computed_at,
      entriesJson: row.entries_json,
    } : null;
  }

  /**
   * Legacy: get the most recent snapshot regardless of window.
   * Prefer getSnapshot(teamId, windowDays) for period-correct behavior.
   */
  public getLatestSnapshot(teamId: string): {
    snapshotId: string;
    windowDays: number;
    computedAt: string;
    entriesJson: string;
  } | null {
    const row = this.database.prepare(`
      SELECT snapshot_id, window_days, computed_at, entries_json
      FROM leaderboard_snapshots
      WHERE team_id = ?
      ORDER BY computed_at DESC
      LIMIT 1
    `).get(teamId) as {
      snapshot_id: string;
      window_days: number;
      computed_at: string;
      entries_json: string;
    } | undefined;

    return row ? {
      snapshotId: row.snapshot_id,
      windowDays: row.window_days,
      computedAt: row.computed_at,
      entriesJson: row.entries_json,
    } : null;
  }

  // User sessions for leaderboard computation — period-aware
  /**
   * Get sessions for a user within a specific time window.
   * @param windowDays Number of days to look back. Use 0 for all time.
   */
  public getUserSessions(githubId: number, teamId: string, windowDays: number = 0): Array<{
    sessionId: string;
    tokenTotal: number;
    costTotalUsd: number;
    efficiencyScore: number | null;
    wasteScore: number | null;
    cacheHitRate: number | null;
    outcome: string | null;
  }> {
    let sql: string;
    let params: Array<number | string>;

    if (windowDays > 0) {
      sql = `
        SELECT session_id, token_total, cost_total_usd, efficiency_score, waste_score, cache_hit_rate, outcome
        FROM leaderboard_sessions
        WHERE user_github_id = ? AND team_id = ? AND started_at >= date('now', ?)
        ORDER BY started_at DESC
      `;
      params = [githubId, teamId, `-${windowDays} days`];
    } else {
      sql = `
        SELECT session_id, token_total, cost_total_usd, efficiency_score, waste_score, cache_hit_rate, outcome
        FROM leaderboard_sessions
        WHERE user_github_id = ? AND team_id = ?
        ORDER BY started_at DESC
      `;
      params = [githubId, teamId];
    }

    const rows = this.database.prepare(sql).all(...params) as Array<{
      session_id: string;
      token_total: number;
      cost_total_usd: number;
      efficiency_score: number | null;
      waste_score: number | null;
      cache_hit_rate: number | null;
      outcome: string | null;
    }>;

    return rows.map((row) => ({
      sessionId: row.session_id,
      tokenTotal: row.token_total,
      costTotalUsd: row.cost_total_usd,
      efficiencyScore: row.efficiency_score,
      wasteScore: row.waste_score,
      cacheHitRate: row.cache_hit_rate,
      outcome: row.outcome,
    }));
  }

  public upsertSession(session: {
    sessionId: string;
    githubId: number;
    teamId: string;
    provider: string;
    startedAt: string;
    endedAt: string | null;
    model: string | null;
    tokenTotal: number;
    costTotalUsd: number;
    efficiencyScore: number | null;
    wasteScore: number | null;
    cacheHitRate: number | null;
    outcome: string | null;
    outcomeConfidence: number | null;
    completionState: string | null;
    verificationState: string | null;
    successScore: number | null;
    executionQualityScore: number | null;
    reworkScore: number | null;
    valueDensityScore: number | null;
    analysisConfidence: number | null;
  }): void {
    this.database.prepare(`
      INSERT INTO leaderboard_sessions (
        session_id, user_github_id, team_id, provider, started_at, ended_at, model,
        token_total, cost_total_usd, efficiency_score, waste_score, cache_hit_rate,
        outcome, outcome_confidence,
        completion_state, verification_state, success_score, execution_quality_score,
        rework_score, value_density_score, analysis_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        token_total = excluded.token_total,
        cost_total_usd = excluded.cost_total_usd,
        efficiency_score = excluded.efficiency_score,
        waste_score = excluded.waste_score,
        cache_hit_rate = excluded.cache_hit_rate,
        outcome = excluded.outcome,
        outcome_confidence = excluded.outcome_confidence,
        completion_state = excluded.completion_state,
        verification_state = excluded.verification_state,
        success_score = excluded.success_score,
        execution_quality_score = excluded.execution_quality_score,
        rework_score = excluded.rework_score,
        value_density_score = excluded.value_density_score,
        analysis_confidence = excluded.analysis_confidence
    `).run(
      session.sessionId, session.githubId, session.teamId, session.provider,
      session.startedAt, session.endedAt, session.model,
      session.tokenTotal, session.costTotalUsd, session.efficiencyScore,
      session.wasteScore, session.cacheHitRate, session.outcome, session.outcomeConfidence,
      session.completionState, session.verificationState, session.successScore,
      session.executionQualityScore, session.reworkScore, session.valueDensityScore,
      session.analysisConfidence,
    );
  }
}

export function defaultLeaderboardDatabasePath(): string {
  const envPath = process.env.TTM_LEADERBOARD_DB_PATH;
  if (envPath) {
    const validated = validateLeaderboardPath(envPath);
    if (!validated.valid) {
      throw new Error(`Invalid TTM_LEADERBOARD_DB_PATH: ${validated.error}`);
    }
    return validated.path;
  }
  return join(process.cwd(), '.ttm', 'leaderboard.sqlite');
}

interface ValidationResult {
  valid: boolean;
  path: string;
  error?: string;
}

function validateLeaderboardPath(path: string): ValidationResult {
  if (!path || typeof path !== 'string') {
    return { valid: false, path: '', error: 'Path must be a non-empty string' };
  }

  const normalizedPath = path.trim();
  
  if (normalizedPath.length === 0 || normalizedPath.length > 4096) {
    return { valid: false, path: '', error: 'Path length must be between 1 and 4096 characters' };
  }

  if (normalizedPath.includes('..')) {
    return { valid: false, path: '', error: 'Path traversal not allowed' };
  }

  const isAbsolute = normalizedPath.startsWith('/') || /^[a-zA-Z]:/.test(normalizedPath);
  const isRelative = !isAbsolute && /^[a-zA-Z0-9_\-\.]+$/.test(normalizedPath);
  
  if (!isAbsolute && !isRelative) {
    return { valid: false, path: '', error: 'Invalid path format' };
  }

  const resolved = isAbsolute ? normalizedPath : join(process.cwd(), normalizedPath);
  
  return { valid: true, path: resolved };
}
