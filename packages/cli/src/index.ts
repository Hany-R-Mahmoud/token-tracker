#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ProviderId } from '@ttm/core';
import {
  CodexAdapter,
  OpenCodeAdapter,
  StaticPricingReader,
  TtmDatabase,
  TtmReadService,
  defaultDatabasePath,
  enrichSession,
  KNOWN_PROVIDERS,
  type ComparisonSnapshot,
  type ProviderReading,
  type ReferenceAppId,
  computeDiscrepancies,
  determineComparisonStatus,
  buildDiscrepancySummary,
} from '@ttm/core';
import {
  formatKeyValueLine,
  formatSessionDetailLines,
  formatSessionRow,
  formatSummaryRow,
} from './output.js';

type CliCommand = 'doctor' | 'providers' | 'summary' | 'import' | 'export' | 'compare-snapshot';
type ExtendedCliCommand = CliCommand | 'sessions' | 'analyze';

async function main(): Promise<void> {
  const command = (process.argv[2] ?? 'doctor') as ExtendedCliCommand;

  switch (command) {
    case 'doctor':
      await runDoctor();
      return;
    case 'providers':
      printProviders();
      return;
    case 'summary':
      printSummary();
      return;
    case 'import':
      await runImport();
      return;
    case 'export':
      runExport(process.argv.slice(3));
      return;
    case 'compare-snapshot':
      runCompareSnapshot(process.argv.slice(3));
      return;
    case 'sessions':
      printSessions(process.argv.slice(3));
      return;
    case 'analyze':
      printSessionAnalysis(process.argv[3] ?? null);
      return;
    default:
      printHelp();
  }
}

async function runDoctor(): Promise<void> {
  const database = new TtmDatabase();
  const adapters = [new CodexAdapter(), new OpenCodeAdapter()];
  const adapterProviders = new Set<string>(adapters.map((a) => a.provider));

  process.stdout.write(`${formatKeyValueLine('database', database.path || defaultDatabasePath())}\n`);

  for (const adapter of adapters) {
    const health = await adapter.healthCheck({
      storage: database,
      pricing: new StaticPricingReader(),
      clock: new Date(),
      paths: {},
      limits: {
        maxBytesPerFile: 1024 * 1024 * 8,
        maxFilesPerPass: 500,
      },
    });

    const entry = KNOWN_PROVIDERS.find((e) => e.provider === adapter.provider);
    const strategyStatus = entry ? formatStrategyStatus(entry.strategyStatus) : adapter.provider;

    process.stdout.write(`${formatKeyValueLine('provider', adapter.provider)}\n`);
    process.stdout.write(`${formatKeyValueLine('status', strategyStatus)}\n`);
    process.stdout.write(`${formatKeyValueLine('sources found', health.sourcesFound)}\n`);
    process.stdout.write(
      `${formatKeyValueLine('provider health', describeProviderHealth(health))}\n`,
    );
    process.stdout.write(
      `${formatKeyValueLine('issues', health.issues.length > 0 ? health.issues.join(', ') : 'none')}\n`,
    );
  }

  for (const entry of KNOWN_PROVIDERS) {
    if (adapterProviders.has(entry.provider as ProviderId)) {
      continue;
    }

    process.stdout.write(`${formatKeyValueLine('provider', entry.provider)}\n`);
    process.stdout.write(`${formatKeyValueLine('status', formatStrategyStatus(entry.strategyStatus))}\n`);
    if (entry.incidentStatus !== 'ok') {
      process.stdout.write(`${formatKeyValueLine('incident', formatIncidentStatus(entry.incidentStatus))}\n`);
    }
    if (entry.incidentNote) {
      process.stdout.write(`${formatKeyValueLine('incident note', entry.incidentNote)}\n`);
    }
    process.stdout.write(`${formatKeyValueLine('note', entry.note)}\n`);
  }
}

function formatIncidentStatus(status: string): string {
  switch (status) {
    case 'ok': return 'ok';
    case 'degraded': return 'degraded';
    case 'incident': return 'incident';
    case 'auth_needed': return 'auth needed';
    case 'maintenance': return 'maintenance';
    default: return status;
  }
}

function formatStrategyStatus(status: string): string {
  switch (status) {
    case 'validated':
      return 'validated';
    case 'strategy_pending':
      return 'strategy pending';
    case 'experimental':
      return 'experimental';
    case 'unavailable':
      return 'unavailable';
    default:
      return status;
  }
}

async function runImport(): Promise<void> {
  const database = new TtmDatabase();
  const adapters = [new CodexAdapter(), new OpenCodeAdapter()];
  let importedSessions = 0;
  let scannedSources = 0;
  const warnings = new Set<string>();

  for (const adapter of adapters) {
    const result = await adapter.import({
      storage: database,
      pricing: new StaticPricingReader(),
      clock: new Date(),
      paths: {},
      limits: {
        maxBytesPerFile: 1024 * 1024 * 8,
        maxFilesPerPass: 250,
      },
    });

    for (const seed of result.sessions) {
      database.upsertSession(enrichSession(seed));
    }

    await database.writeCheckpoints(result.checkpointWrites);
    importedSessions += result.sessions.length;
    scannedSources += result.metrics.scannedSources;
    for (const warning of result.warnings) {
      warnings.add(warning);
    }
  }

  process.stdout.write(`${formatKeyValueLine('database', database.path || defaultDatabasePath())}\n`);
  process.stdout.write(`${formatKeyValueLine('imported sessions', importedSessions)}\n`);
  process.stdout.write(`${formatKeyValueLine('scanned sources', scannedSources)}\n`);
  if (warnings.size > 0) {
    process.stdout.write(`${formatKeyValueLine('warnings', Array.from(warnings).join(', '))}\n`);
  }
}

interface ExportArgs {
  ok: true;
  outputPath: string;
  days: number;
}

interface ExportArgsError {
  ok: false;
  message: string;
}

function parseExportArgs(args: string[]): ExportArgs | ExportArgsError {
  let outputPath = 'ttm-export.json';
  let days = 30;

  let index = 0;
  while (index < args.length) {
    const arg = args[index];

    if (arg === '--days') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: 'usage: ttm export [output-path] [--days <count>]' };
      }
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return { ok: false, message: '--days must be a positive integer' };
      }
      days = parsed;
      index += 2;
      continue;
    }

    if (arg.startsWith('--')) {
      return { ok: false, message: `unknown export flag: ${arg}` };
    }

    if (outputPath === 'ttm-export.json') {
      outputPath = arg;
    } else {
      return { ok: false, message: 'usage: ttm export [output-path] [--days <count>]' };
    }

    index += 1;
  }

  return { ok: true, outputPath, days };
}

function runExport(args: string[]): void {
  const parsed = parseExportArgs(args);
  if (!parsed.ok) {
    process.stdout.write(`${parsed.message}\n`);
    return;
  }

  const validated = validateExportPath(parsed.outputPath);
  if (!validated.valid) {
    process.stdout.write(`error: ${validated.error}\n`);
    return;
  }

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const bundle = readService.buildExportBundle(parsed.days);

  writeFileSync(validated.path, JSON.stringify(bundle, null, 2), 'utf8');
  process.stdout.write(`${formatKeyValueLine('export path', validated.path)}\n`);
  process.stdout.write(`${formatKeyValueLine('window days', parsed.days)}\n`);
  process.stdout.write(`${formatKeyValueLine('sessions exported', bundle.sessionCount)}\n`);
  process.stdout.write(`${formatKeyValueLine('providers', bundle.providerSummaries.length)}\n`);
  process.stdout.write(`${formatKeyValueLine('models', bundle.modelSummaries.length)}\n`);
  process.stdout.write(`${formatKeyValueLine('daily buckets', bundle.dailyBuckets.length)}\n`);
  process.stdout.write(`${formatKeyValueLine('raw prompts included', 'false')}\n`);
  process.stdout.write(`${formatKeyValueLine('raw transcripts included', 'false')}\n`);
}

interface CompareSnapshotArgs {
  ok: true;
  outputPath: string;
  provider: string;
  referenceApp: ReferenceAppId | null;
  refSessions: number | null;
  refTokens: number | null;
  refCostUsd: number | null;
  refEfficiency: number | null;
  refResetWindow: string | null;
}

interface CompareSnapshotArgsError {
  ok: false;
  message: string;
}

function parseCompareSnapshotArgs(args: string[]): CompareSnapshotArgs | CompareSnapshotArgsError {
  const comparisonsDir = join(process.cwd(), '.ttm', 'comparisons');
  const defaultFileName = `comparison-${new Date().toISOString().slice(0, 10)}.json`;
  let outputPath: string | null = null;
  let provider: string | undefined;
  let referenceApp: ReferenceAppId | null = null;
  let refSessions: number | null = null;
  let refTokens: number | null = null;
  let refCostUsd: number | null = null;
  let refEfficiency: number | null = null;
  let refResetWindow: string | null = null;

  let index = 0;
  while (index < args.length) {
    const arg = args[index];

    if (arg === '--provider') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: 'usage: ttm compare-snapshot --provider <id> [output-path] [--reference-app <app>] [--ref-sessions <n>] [--ref-tokens <n>] [--ref-cost-usd <n>] [--ref-efficiency <n>] [--ref-reset-window <str>]' };
      }
      provider = value;
      index += 2;
      continue;
    }

    if (arg === '--reference-app') {
      const value = args[index + 1];
      if (!value || !isReferenceAppId(value)) {
        return { ok: false, message: '--reference-app must be one of: codexbar, ai-token-monitor, tokscale' };
      }
      referenceApp = value;
      index += 2;
      continue;
    }

    if (arg === '--ref-sessions') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: '--ref-sessions requires a number' };
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return { ok: false, message: '--ref-sessions must be a valid number' };
      }
      if (parsed < 0) {
        return { ok: false, message: '--ref-sessions must not be negative' };
      }
      refSessions = parsed;
      index += 2;
      continue;
    }

    if (arg === '--ref-tokens') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: '--ref-tokens requires a number' };
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return { ok: false, message: '--ref-tokens must be a valid number' };
      }
      if (parsed < 0) {
        return { ok: false, message: '--ref-tokens must not be negative' };
      }
      refTokens = parsed;
      index += 2;
      continue;
    }

    if (arg === '--ref-cost-usd') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: '--ref-cost-usd requires a number' };
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return { ok: false, message: '--ref-cost-usd must be a valid number' };
      }
      if (parsed < 0) {
        return { ok: false, message: '--ref-cost-usd must not be negative' };
      }
      refCostUsd = parsed;
      index += 2;
      continue;
    }

    if (arg === '--ref-efficiency') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: '--ref-efficiency requires a number' };
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return { ok: false, message: '--ref-efficiency must be a valid number' };
      }
      refEfficiency = parsed;
      index += 2;
      continue;
    }

    if (arg === '--ref-reset-window') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: '--ref-reset-window requires a string' };
      }
      refResetWindow = value;
      index += 2;
      continue;
    }

    if (arg.startsWith('--')) {
      return { ok: false, message: `unknown compare-snapshot flag: ${arg}` };
    }

    // First non-flag positional arg is the output path
    if (outputPath === null) {
      outputPath = arg;
    } else {
      return { ok: false, message: 'usage: ttm compare-snapshot --provider <id> [output-path] [flags]' };
    }

    index += 1;
  }

  if (!provider) {
    return { ok: false, message: 'usage: ttm compare-snapshot --provider <id> [output-path] [--reference-app <app>] [--ref-sessions <n>] [--ref-tokens <n>] [--ref-cost-usd <n>] [--ref-efficiency <n>] [--ref-reset-window <str>]' };
  }

  const resolvedPath = outputPath ?? join(comparisonsDir, defaultFileName);

  return { ok: true, outputPath: resolvedPath, provider, referenceApp, refSessions, refTokens, refCostUsd, refEfficiency, refResetWindow };
}

function isReferenceAppId(value: string): value is ReferenceAppId {
  return value === 'codexbar' || value === 'ai-token-monitor' || value === 'tokscale';
}

function runCompareSnapshot(args: string[]): void {
  const parsed = parseCompareSnapshotArgs(args);
  if (!parsed.ok) {
    process.stdout.write(`${parsed.message}\n`);
    return;
  }

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const summary = readService.getSummarySnapshot();
  const providerSummary = summary.providerSummaries.find((p) => p.provider === parsed.provider);

  const ourReading: ProviderReading = providerSummary
    ? {
        sessionCount: providerSummary.sessions,
        totalTokens: providerSummary.totalTokens,
        totalCostUsd: providerSummary.totalCostUsd,
        averageEfficiency: providerSummary.averageEfficiency,
        resetWindow: null,
        additionalFields: {
          pricedSessions: providerSummary.pricedSessions,
          unpricedSessions: providerSummary.unpricedSessions,
        },
      }
    : {
        sessionCount: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        averageEfficiency: null,
        resetWindow: null,
        additionalFields: {
          note: `no data found for provider: ${parsed.provider}`,
        },
      };

  const hasReferenceData = parsed.refSessions !== null || parsed.refTokens !== null || parsed.refCostUsd !== null || parsed.refEfficiency !== null || parsed.refResetWindow !== null;

  const referenceReading: ProviderReading = hasReferenceData
    ? {
        sessionCount: parsed.refSessions,
        totalTokens: parsed.refTokens,
        totalCostUsd: parsed.refCostUsd,
        averageEfficiency: parsed.refEfficiency,
        resetWindow: parsed.refResetWindow,
        additionalFields: {},
      }
    : {
        sessionCount: null,
        totalTokens: null,
        totalCostUsd: null,
        averageEfficiency: null,
        resetWindow: null,
        additionalFields: {},
      };

  const discrepancies = computeDiscrepancies(ourReading, referenceReading);
  const status = determineComparisonStatus(ourReading, referenceReading, discrepancies);
  const discrepancySummary = buildDiscrepancySummary(status, discrepancies);

  const notes: string[] = [];
  if (!hasReferenceData) {
    notes.push('This artifact contains our-side reading only.');
    notes.push('Reference app data is not yet populated.');
    notes.push('Use --reference-app and --ref-* flags to provide reference app readings.');
  } else {
    notes.push(`Reference app: ${parsed.referenceApp ?? 'manual input'}`);
    if (discrepancies.length > 0) {
      notes.push(`${discrepancies.length} discrepancy(ies) detected.`);
      for (const d of discrepancies) {
        notes.push(`  ${d.field}: ${d.notes}`);
      }
    } else {
      notes.push('No significant discrepancies found between our reading and reference reading.');
    }
  }

  const snapshot: ComparisonSnapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    referenceApp: parsed.referenceApp,
    provider: parsed.provider,
    ourReading,
    referenceReading,
    discrepancies,
    discrepancySummary,
    status,
    confidence: null,
    notes,
  };

  mkdirSync(join(process.cwd(), '.ttm'), { recursive: true });
  mkdirSync(join(process.cwd(), '.ttm', 'comparisons'), { recursive: true });
  writeFileSync(parsed.outputPath, JSON.stringify(snapshot, null, 2), 'utf8');
  process.stdout.write(`${formatKeyValueLine('snapshot path', parsed.outputPath)}\n`);
  process.stdout.write(`${formatKeyValueLine('provider', parsed.provider)}\n`);
  process.stdout.write(`${formatKeyValueLine('our sessions', ourReading.sessionCount ?? 'n/a')}\n`);
  process.stdout.write(`${formatKeyValueLine('our tokens', ourReading.totalTokens ?? 'n/a')}\n`);
  process.stdout.write(`${formatKeyValueLine('our cost usd', ourReading.totalCostUsd ?? 'n/a')}\n`);
  process.stdout.write(`${formatKeyValueLine('status', snapshot.status)}\n`);
  process.stdout.write(`${formatKeyValueLine('summary', discrepancySummary.statusLabel)}\n`);
  if (hasReferenceData) {
    process.stdout.write(`${formatKeyValueLine('reference app', parsed.referenceApp ?? 'manual')}\n`);
    process.stdout.write(`${formatKeyValueLine('ref sessions', referenceReading.sessionCount ?? 'n/a')}\n`);
    process.stdout.write(`${formatKeyValueLine('ref tokens', referenceReading.totalTokens ?? 'n/a')}\n`);
    process.stdout.write(`${formatKeyValueLine('ref cost usd', referenceReading.totalCostUsd ?? 'n/a')}\n`);
    process.stdout.write(`${formatKeyValueLine('discrepancies', String(discrepancies.length))}\n`);
    if (discrepancies.length > 0) {
      process.stdout.write('discrepancy details:\n');
      for (const d of discrepancies) {
        process.stdout.write(`  ${d.field}: our=${d.ourValue} ref=${d.referenceValue} (${d.notes})\n`);
      }
    }
  } else {
    process.stdout.write(`${formatKeyValueLine('reference data', 'not provided')}\n`);
  }
}

function printProviders(): void {
  process.stdout.write('known providers:\n');
  for (const entry of KNOWN_PROVIDERS) {
    const incident = entry.incidentStatus !== 'ok' ? ` [${formatIncidentStatus(entry.incidentStatus)}]` : '';
    process.stdout.write(`  ${entry.provider}: ${formatStrategyStatus(entry.strategyStatus)}${incident} — ${entry.note}\n`);
  }
}

function printSummary(): void {
  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const summary = readService.getSummarySnapshot();

  process.stdout.write(`${formatKeyValueLine('database', summary.databasePath || defaultDatabasePath())}\n`);
  process.stdout.write(`${formatKeyValueLine('stored sessions', summary.sessionCount)}\n`);
  for (const providerSummary of summary.providerSummaries) {
    process.stdout.write(`${formatSummaryRow(providerSummary)}\n`);
    if (providerSummary.unpricedSessions > 0) {
      process.stdout.write(
        `${formatKeyValueLine('pricing warning', `${providerSummary.provider} has ${providerSummary.unpricedSessions} session(s) with unknown pricing`)}\n`,
      );
    }
  }
}

function printSessions(args: string[]): void {
  const filters = parseSessionFilters(args);
  if (!filters.ok) {
    process.stdout.write(`${filters.message}\n`);
    return;
  }

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const sessions = readService.listRecentSessions({
    limit: filters.limit,
    provider: filters.provider,
  });

  if (filters.provider) {
    process.stdout.write(`${formatKeyValueLine('provider filter', filters.provider)}\n`);
  }
  process.stdout.write(`${formatKeyValueLine('limit', filters.limit)}\n`);

  for (const session of sessions) {
    process.stdout.write(`${formatSessionRow(session)}\n`);
  }
}

function printSessionAnalysis(sessionId: string | null): void {
  if (!sessionId) {
    process.stdout.write('usage: ttm analyze <session-id>\n');
    return;
  }

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const session = readService.getSessionDetail(sessionId);
  if (!session) {
    process.stdout.write(`session not found: ${sessionId}\n`);
    return;
  }

  for (const line of formatSessionDetailLines(session)) {
    process.stdout.write(`${line}\n`);
  }

  if (session.pricingSnapshotId === null) {
    process.stdout.write('pricing_note: total cost is not available because this model has no trusted pricing snapshot\n');
  }
}

function printHelp(): void {
  process.stdout.write('usage: ttm <doctor|providers|import|summary|export|compare-snapshot|sessions|analyze>\n');
  process.stdout.write('export args: [output-path] [--days <count>]\n');
  process.stdout.write('compare-snapshot args: --provider <id> [output-path] [--reference-app <app>] [--ref-sessions <n>] [--ref-tokens <n>] [--ref-cost-usd <n>] [--ref-efficiency <n>] [--ref-reset-window <str>]\n');
  process.stdout.write('sessions flags: [--provider <provider>] [--limit <count>]\n');
}

function describeProviderHealth(health: { status: string; sourcesFound: number; issues: string[] }): string {
  if (health.status === 'ok') {
    return `source reachable (${health.sourcesFound} found)`;
  }

  if (health.issues.length > 0) {
    return `attention needed (${health.issues.join(', ')})`;
  }

  return `attention needed (${health.sourcesFound} found)`;
}

function parseSessionFilters(args: string[]):
  | { ok: true; provider: string | undefined; limit: number }
  | { ok: false; message: string } {
  let provider: string | undefined;
  let limit = 15;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--provider') {
      const value = args[index + 1];
      if (!value) {
        return { ok: false, message: 'usage: ttm sessions [--provider <provider>] [--limit <count>]' };
      }
      provider = value;
      index += 1;
      continue;
    }

    if (arg === '--limit') {
      const value = args[index + 1];
      const parsed = value ? Number(value) : Number.NaN;
      if (!value || !Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        return { ok: false, message: 'limit must be an integer between 1 and 100' };
      }
      limit = parsed;
      index += 1;
      continue;
    }

    return { ok: false, message: `unknown sessions flag: ${arg}` };
  }

  return { ok: true, provider, limit };
}

interface ExportValidationResult {
  valid: boolean;
  path: string;
  error?: string;
}

function validateExportPath(path: string): ExportValidationResult {
  if (!path || typeof path !== 'string') {
    return { valid: false, path: '', error: 'Output path must be a non-empty string' };
  }

  const normalizedPath = path.trim();
  
  if (normalizedPath.length === 0 || normalizedPath.length > 4096) {
    return { valid: false, path: '', error: 'Path length must be between 1 and 4096 characters' };
  }

  if (normalizedPath.includes('..')) {
    return { valid: false, path: '', error: 'Path traversal not allowed' };
  }

  const isAbsolute = normalizedPath.startsWith('/') || /^[a-zA-Z]:/.test(normalizedPath);
  const isRelative = !isAbsolute && /^[a-zA-Z0-9_\-\.\\/]+$/.test(normalizedPath);
  
  if (!isAbsolute && !isRelative) {
    return { valid: false, path: '', error: 'Invalid path format' };
  }

  const resolved = isAbsolute ? normalizedPath : join(process.cwd(), normalizedPath);
  
  return { valid: true, path: resolved };
}

void main();
