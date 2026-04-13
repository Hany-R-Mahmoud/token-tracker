import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';
import { success, error } from './utils.js';
import type { ReferenceAppId } from '@ttm/core';

const DESCRIPTION = 'Compare local readings against reference app snapshots';

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

function parseCompareSnapshotArgs(args: string[], cwd: string): CompareSnapshotArgs | CompareSnapshotArgsError {
  const comparisonsDir = cwd + '/.ttm/comparisons';
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
      if (!Number.isFinite(parsed) || parsed < 0) {
        return { ok: false, message: '--ref-sessions must be a valid non-negative number' };
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
      if (!Number.isFinite(parsed) || parsed < 0) {
        return { ok: false, message: '--ref-tokens must be a valid non-negative number' };
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
      if (!Number.isFinite(parsed) || parsed < 0) {
        return { ok: false, message: '--ref-cost-usd must be a valid non-negative number' };
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

  const resolvedPath = outputPath ?? (cwd + '/.ttm/comparisons/' + defaultFileName);

  return { ok: true, outputPath: resolvedPath, provider, referenceApp, refSessions, refTokens, refCostUsd, refEfficiency, refResetWindow };
}

function isReferenceAppId(value: string): value is ReferenceAppId {
  return value === 'codexbar' || value === 'ai-token-monitor' || value === 'tokscale';
}

interface ProviderReadingData {
  sessionCount: number | null;
  totalTokens: number | null;
  totalCostUsd: number | null;
  averageEfficiency: number | null;
  resetWindow: string | null;
  additionalFields: Record<string, unknown>;
}

interface ComparisonSnapshotData {
  id: string;
  createdAt: string;
  referenceApp: ReferenceAppId | null;
  provider: string;
  ourReading: ProviderReadingData;
  referenceReading: ProviderReadingData;
  discrepancies: Array<{ field: string; ourValue: string; referenceValue: string; notes: string }>;
  discrepancySummary: { statusLabel: string };
  status: string;
  confidence: number | null;
  notes: string[];
}

export const compareSnapshotCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  const parsed = parseCompareSnapshotArgs(context.args, process.cwd());
  if (!parsed.ok) {
    return error(parsed.message);
  }

  try {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    const core = await import('@ttm/core');
    const { formatKeyValueLine } = await import('../output.js');

    const database = new core.TtmDatabase();
    const readService = new core.TtmReadService(database);
    const summary = readService.getSummarySnapshot();
    const providerSummary = summary.providerSummaries.find((p: { provider: string }) => p.provider === parsed.provider);

    const ourReading: ProviderReadingData = providerSummary
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

    const referenceReading: ProviderReadingData = hasReferenceData
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

    const discrepancies = core.computeDiscrepancies(ourReading as any, referenceReading as any);
    const status = core.determineComparisonStatus(ourReading as any, referenceReading as any, discrepancies);
    const discrepancySummary = core.buildDiscrepancySummary(status, discrepancies);

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

    const snapshot: ComparisonSnapshotData = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      referenceApp: parsed.referenceApp,
      provider: parsed.provider,
      ourReading,
      referenceReading,
      discrepancies: discrepancies.map((d: any) => ({ field: d.field, ourValue: String(d.ourValue ?? ''), referenceValue: String(d.referenceValue ?? ''), notes: d.notes })),
      discrepancySummary,
      status,
      confidence: null,
      notes,
    };

    mkdirSync(process.cwd() + '/.ttm', { recursive: true });
    mkdirSync(process.cwd() + '/.ttm/comparisons', { recursive: true });
    writeFileSync(parsed.outputPath, JSON.stringify(snapshot, null, 2), 'utf8');

    const lines: string[] = [];
    lines.push(formatKeyValueLine('snapshot path', parsed.outputPath));
    lines.push(formatKeyValueLine('provider', parsed.provider));
    lines.push(formatKeyValueLine('our sessions', ourReading.sessionCount ?? 'n/a'));
    lines.push(formatKeyValueLine('our tokens', ourReading.totalTokens ?? 'n/a'));
    lines.push(formatKeyValueLine('our cost usd', ourReading.totalCostUsd ?? 'n/a'));
    lines.push(formatKeyValueLine('status', snapshot.status));
    lines.push(formatKeyValueLine('summary', discrepancySummary.statusLabel));
    if (hasReferenceData) {
      lines.push(formatKeyValueLine('reference app', parsed.referenceApp ?? 'manual'));
      lines.push(formatKeyValueLine('ref sessions', referenceReading.sessionCount ?? 'n/a'));
      lines.push(formatKeyValueLine('ref tokens', referenceReading.totalTokens ?? 'n/a'));
      lines.push(formatKeyValueLine('ref cost usd', referenceReading.totalCostUsd ?? 'n/a'));
      lines.push(formatKeyValueLine('discrepancies', String(discrepancies.length)));
      if (discrepancies.length > 0) {
        lines.push('discrepancy details:');
        for (const d of discrepancies) {
          lines.push(`  ${d.field}: our=${d.ourValue} ref=${d.referenceValue} (${d.notes})`);
        }
      }
    } else {
      lines.push(formatKeyValueLine('reference data', 'not provided'));
    }

    return success(...lines);
  } catch (e) {
    return error(`compare-snapshot failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const help = DESCRIPTION;