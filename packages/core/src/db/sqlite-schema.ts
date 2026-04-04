export const SQLITE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_session_id TEXT NOT NULL,
    source_path TEXT NOT NULL,
    project_path TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    last_activity_at TEXT NOT NULL,
    duration_ms INTEGER,
    model TEXT,
    model_family TEXT,
    title TEXT,
    message_count INTEGER NOT NULL DEFAULT 0,
    tool_call_count INTEGER NOT NULL DEFAULT 0,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    token_input INTEGER NOT NULL DEFAULT 0,
    token_output INTEGER NOT NULL DEFAULT 0,
    token_cached_input INTEGER NOT NULL DEFAULT 0,
    token_cached_write INTEGER NOT NULL DEFAULT 0,
    token_reasoning INTEGER NOT NULL DEFAULT 0,
    token_total INTEGER NOT NULL DEFAULT 0,
    cost_input_usd REAL NOT NULL DEFAULT 0,
    cost_output_usd REAL NOT NULL DEFAULT 0,
    cost_cache_read_usd REAL NOT NULL DEFAULT 0,
    cost_cache_write_usd REAL NOT NULL DEFAULT 0,
    cost_total_usd REAL NOT NULL DEFAULT 0,
    pricing_snapshot_id TEXT,
    cache_hit_rate REAL,
    cache_eligible_tokens INTEGER,
    outcome TEXT NOT NULL DEFAULT 'unknown',
    outcome_confidence REAL,
    task_category TEXT NOT NULL DEFAULT 'unknown',
    task_category_confidence REAL,
    efficiency_score INTEGER,
    waste_score INTEGER,
    anomaly_score REAL,
    loop_count INTEGER NOT NULL DEFAULT 0,
    reset_window_kind TEXT,
    reset_window_resets_at TEXT,
    reset_window_remaining_percent REAL,
    score_version TEXT,
    parser_version TEXT NOT NULL,
    contains_sensitive_text INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS session_flags (
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    flag TEXT NOT NULL,
    PRIMARY KEY (session_id, flag)
  )`,
  `CREATE TABLE IF NOT EXISTS session_score_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    factor_key TEXT NOT NULL,
    label TEXT NOT NULL,
    impact INTEGER NOT NULL,
    direction TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS session_explanations (
    session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    outcome_reasons_json TEXT NOT NULL,
    waste_reasons_json TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS provider_checkpoints (
    provider TEXT NOT NULL,
    source_id TEXT NOT NULL,
    cursor_type TEXT NOT NULL,
    cursor_value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (provider, source_id)
  )`,
  `CREATE TABLE IF NOT EXISTS pricing_snapshots (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    model_key TEXT NOT NULL,
    input_per_million_usd REAL,
    output_per_million_usd REAL,
    cache_read_per_million_usd REAL,
    cache_write_per_million_usd REAL,
    raw_json TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS provider_health (
    provider TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    last_successful_import_at TEXT,
    last_checked_at TEXT NOT NULL,
    sources_found INTEGER NOT NULL DEFAULT 0,
    issues_json TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS daily_aggregates (
    day TEXT NOT NULL,
    provider TEXT NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost_usd REAL NOT NULL DEFAULT 0,
    avg_efficiency_score REAL,
    avg_waste_score REAL,
    success_rate REAL,
    PRIMARY KEY (day, provider)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_provider_started_at
    ON sessions(provider, started_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_project_path
    ON sessions(project_path)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_model
    ON sessions(model)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_outcome
    ON sessions(outcome)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_task_category
    ON sessions(task_category)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_last_activity_at
    ON sessions(last_activity_at DESC)`,
] as const;

