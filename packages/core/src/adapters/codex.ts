import { readFile, stat } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { extname } from 'node:path';
import {
  type AdapterContext,
  type AdapterHealth,
  type DiscoveredSource,
  type DiscoveryResult,
  type ImportResult,
  type ProviderAdapter,
  type ProviderCheckpoint,
} from './types.js';
import type { CanonicalSessionSeed } from '../domain/session.js';
import { deriveBoundedTitle, isUsefulPromptText } from '../utils/text.js';

interface CodexJsonlRecord {
  timestamp?: string;
  type?: string;
  payload?: Record<string, unknown>;
}

export class CodexAdapter implements ProviderAdapter {
  public readonly provider = 'codex' as const;
  public readonly version = '0.1.0';

  public async discover(context: AdapterContext): Promise<DiscoveryResult> {
    const rootPath = context.paths.codexRoot ?? `${process.env.HOME ?? ''}/.codex/sessions`;
    const sources: DiscoveredSource[] = [];

    for await (const entry of glob(`${rootPath}/**/*.jsonl`)) {
      if (sources.length >= context.limits.maxFilesPerPass) {
        break;
      }
      if (extname(entry) !== '.jsonl') {
        continue;
      }
      sources.push({
        id: entry,
        path: entry,
        kind: 'file',
      });
    }

    return {
      sources,
      warnings: sources.length > 0 ? [] : ['codex_source_not_found'],
    };
  }

  public async import(context: AdapterContext): Promise<ImportResult> {
    const discovery = await this.discover(context);
    const sessions: CanonicalSessionSeed[] = [];
    const checkpointWrites: ProviderCheckpoint[] = [];
    const warnings = [...discovery.warnings];
    let skippedRecords = 0;

    for (const source of discovery.sources) {
      const checkpoint = await context.storage.readCheckpoint(this.provider, source.id);
      const content = await readFile(source.path, 'utf8');
      const sourceStat = await stat(source.path);

      if (checkpoint && checkpoint.cursorValue === String(sourceStat.size)) {
        continue;
      }

      const parsed = await this.parseFile(source.path, content, context);
      sessions.push(...parsed.sessions);
      skippedRecords += parsed.skippedRecords;
      warnings.push(...parsed.warnings);
      checkpointWrites.push({
        provider: this.provider,
        sourceId: source.id,
        cursorType: 'byte_offset',
        cursorValue: String(sourceStat.size),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      sessions,
      checkpointWrites,
      warnings,
      metrics: {
        scannedSources: discovery.sources.length,
        importedSessions: sessions.length,
        skippedRecords,
      },
    };
  }

  public async healthCheck(context: AdapterContext): Promise<AdapterHealth> {
    const discovery = await this.discover(context);

    return {
      status: discovery.sources.length > 0 ? 'ok' : 'broken',
      sourcesFound: discovery.sources.length,
      lastSuccessfulImportAt: null,
      issues: discovery.warnings,
    };
  }

  private async parseFile(
    sourcePath: string,
    content: string,
    context: AdapterContext,
  ): Promise<{ sessions: CanonicalSessionSeed[]; skippedRecords: number; warnings: string[] }> {
    const warnings: string[] = [];
    const records: CodexJsonlRecord[] = [];
    let skippedRecords = 0;

    for (const line of content.split('\n')) {
      if (line.trim().length === 0) {
        continue;
      }
      try {
        records.push(JSON.parse(line) as CodexJsonlRecord);
      } catch {
        skippedRecords += 1;
      }
    }

    const sessionMeta = records.find((record) => record.type === 'session_meta');
    if (!sessionMeta?.payload) {
      return { sessions: [], skippedRecords, warnings: ['codex_missing_session_meta'] };
    }

    const sessionId = stringValue(sessionMeta.payload.id);
    const startedAt = stringValue(sessionMeta.payload.timestamp) ?? sessionMeta.timestamp ?? null;
    const projectPath =
      stringValue(sessionMeta.payload.cwd) ??
      stringValue(
        (records.find((record) => record.type === 'turn_context')?.payload?.cwd) as
          | string
          | undefined,
      ) ??
      null;

    if (!sessionId || !startedAt) {
      return { sessions: [], skippedRecords, warnings: ['codex_missing_session_identity'] };
    }

    const turnContextRecords = records.filter((record) => record.type === 'turn_context');
    const model =
      stringValue(turnContextRecords.at(-1)?.payload?.model) ??
      stringValue(sessionMeta.payload.model) ??
      null;

    const tokenSnapshots = records
      .filter(
        (record) =>
          record.type === 'event_msg' &&
          stringValue(record.payload?.type) === 'token_count',
      )
      .map((record) => record.payload ?? {});
    const latestToken = tokenSnapshots.at(-1) ?? {};
    const tokenInfo = objectValue(latestToken.info);
    const totalUsage = objectValue(tokenInfo?.total_token_usage);
    const rateLimits = objectValue(latestToken.rate_limits);

    const responseItems = records.filter((record) => record.type === 'response_item');
    const userMessages = responseItems.filter(
      (record) =>
        stringValue(record.payload?.type) === 'message' &&
        stringValue(record.payload?.role) === 'user',
    );
    const assistantMessages = responseItems.filter(
      (record) =>
        stringValue(record.payload?.type) === 'message' &&
        stringValue(record.payload?.role) === 'assistant',
    );

    const taskStartedCount = records.filter(
      (record) =>
        record.type === 'event_msg' && stringValue(record.payload?.type) === 'task_started',
    ).length;
    const taskCompletedCount = records.filter(
      (record) =>
        record.type === 'event_msg' && stringValue(record.payload?.type) === 'task_complete',
    ).length;
    const toolCallCount = responseItems.filter((record) => {
      const type = stringValue(record.payload?.type);
      return type === 'function_call' || type === 'custom_tool_call';
    }).length;

    const firstUserText = extractFirstUserText(userMessages);
    const lastActivityAt = records.at(-1)?.timestamp ?? startedAt;
    const endedAt = taskCompletedCount > 0 ? lastActivityAt : null;
    const durationMs =
      endedAt !== null
        ? Math.max(0, Date.parse(endedAt) - Date.parse(startedAt))
        : null;

    const inputTokens = numberValue(totalUsage?.input_tokens) ?? 0;
    const cachedInputTokens = numberValue(totalUsage?.cached_input_tokens) ?? 0;
    const outputTokens = numberValue(totalUsage?.output_tokens) ?? 0;
    const reasoningTokens = numberValue(totalUsage?.reasoning_output_tokens) ?? 0;
    const totalTokens =
      numberValue(totalUsage?.total_tokens) ??
      inputTokens + outputTokens + reasoningTokens;
    const cacheHitRate =
      totalTokens > 0 ? Math.min(1, cachedInputTokens / totalTokens) : null;
    const resetWindow = buildResetWindow(rateLimits);
    const pricing = await context.pricing.getModelPricing(model);
    const hasKnownPricing =
      pricing.inputPerMillionUsd !== null ||
      pricing.outputPerMillionUsd !== null ||
      pricing.cacheReadPerMillionUsd !== null ||
      pricing.cacheWritePerMillionUsd !== null;
    const inputCost = calculateCostUsd(inputTokens, pricing.inputPerMillionUsd);
    const outputCost = calculateCostUsd(
      outputTokens + reasoningTokens,
      pricing.outputPerMillionUsd,
    );
    const cacheReadCost = calculateCostUsd(
      cachedInputTokens,
      pricing.cacheReadPerMillionUsd,
    );
    const totalCost = inputCost + outputCost + cacheReadCost;

    return {
      sessions: [
        {
          provider: this.provider,
          providerSessionId: sessionId,
          sourcePath,
          projectPath,
          startedAt,
          endedAt,
          lastActivityAt,
          durationMs,
          model,
          modelFamily: model ? model.split('-').slice(0, 2).join('-') : null,
          title: deriveBoundedTitle(firstUserText),
          messageCount: userMessages.length + assistantMessages.length,
          toolCallCount,
          tokens: {
            input: inputTokens,
            output: outputTokens,
            cachedInput: cachedInputTokens,
            cachedWrite: 0,
            reasoning: reasoningTokens,
            total: totalTokens,
          },
          costs: {
            inputUsd: inputCost,
            outputUsd: outputCost,
            cacheReadUsd: cacheReadCost,
            cacheWriteUsd: 0,
            totalUsd: totalCost,
            pricingSnapshotId: hasKnownPricing ? pricing.pricingSnapshotId : null,
          },
          cache: {
            hitRate: cacheHitRate,
            cacheEligibleTokens: cachedInputTokens,
          },
          resetWindow,
          metadata: {
            parserVersion: this.version,
            parserWarnings: warnings,
            providerMetadata: {
              cliVersion: stringValue(sessionMeta.payload.cli_version),
              modelProvider: stringValue(sessionMeta.payload.model_provider),
              pricingDisplayModel: pricing.displayModel,
              pricingInputPerMillionUsd: pricing.inputPerMillionUsd,
              pricingOutputPerMillionUsd: pricing.outputPerMillionUsd,
              pricingCacheReadPerMillionUsd: pricing.cacheReadPerMillionUsd,
              pricingCacheWritePerMillionUsd: pricing.cacheWritePerMillionUsd,
              pricingSource: pricing.pricingSource,
              pricingStatus: hasKnownPricing ? 'known' : 'unknown',
              source: stringValue(sessionMeta.payload.source),
              taskStartedCount,
              taskCompletedCount,
            },
            containsSensitiveText: false,
          },
        },
      ],
      skippedRecords,
      warnings,
    };
  }
}

function buildResetWindow(
  rateLimits: Record<string, unknown> | null,
): CanonicalSessionSeed['resetWindow'] {
  const primary = objectValue(rateLimits?.primary);
  if (!primary) {
    return null;
  }

  const resetsAtSeconds = numberValue(primary.resets_at);
  const usedPercent = numberValue(primary.used_percent);
  const windowMinutes = numberValue(primary.window_minutes) ?? 0;

  return {
    kind: windowMinutes >= 10080 ? 'weekly' : 'session',
    resetsAt:
      resetsAtSeconds !== null
        ? new Date(resetsAtSeconds * 1000).toISOString()
        : null,
    remainingPercent:
      usedPercent !== null ? Math.max(0, 100 - usedPercent) / 100 : null,
  };
}

function extractFirstUserText(records: CodexJsonlRecord[]): string | null {
  let fallback: string | null = null;

  for (const record of records) {
    const payload = objectValue(record.payload);
    const content = Array.isArray(payload?.content) ? payload.content : [];
    for (const item of content) {
      if (typeof item === 'object' && item !== null && 'text' in item) {
        const text = stringValue((item as Record<string, unknown>).text);
        if (isUsefulPromptText(text)) {
          return text;
        }
        fallback ??= text;
      }
    }
  }

  return fallback;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function calculateCostUsd(tokens: number, perMillionUsd: number | null): number {
  if (perMillionUsd === null) {
    return 0;
  }

  return (tokens / 1_000_000) * perMillionUsd;
}
