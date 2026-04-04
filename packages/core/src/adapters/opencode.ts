import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  type AdapterContext,
  type AdapterHealth,
  type DiscoveryResult,
  type ImportResult,
  type ProviderAdapter,
  type ProviderCheckpoint,
} from './types.js';
import type { CanonicalSessionSeed } from '../domain/session.js';
import { deriveBoundedTitle } from '../utils/text.js';

interface OpenCodeSessionRow {
  id: string;
  directory: string;
  title: string;
  time_created: number;
  time_updated: number;
}

interface OpenCodeMessageRow {
  data: string;
}

interface OpenCodeMessageData {
  role?: string;
  modelID?: string;
  providerID?: string;
  cost?: number;
  tokens?: {
    total?: number;
    input?: number;
    output?: number;
    reasoning?: number;
    cache?: {
      read?: number;
      write?: number;
    };
  };
  error?: unknown;
}

export class OpenCodeAdapter implements ProviderAdapter {
  public readonly provider = 'opencode' as const;
  public readonly version = '0.1.0';

  public async discover(context: AdapterContext): Promise<DiscoveryResult> {
    const path =
      context.paths.opencodeRoot ?? `${process.env.HOME ?? ''}/.local/share/opencode/opencode.db`;

    try {
      await access(path, fsConstants.R_OK);
      return {
        sources: [{ id: path, path, kind: 'sqlite' }],
        warnings: [],
      };
    } catch {
      return {
        sources: [],
        warnings: ['opencode_source_not_found'],
      };
    }
  }

  public async import(context: AdapterContext): Promise<ImportResult> {
    const discovery = await this.discover(context);
    if (discovery.sources.length === 0) {
      return {
        sessions: [],
        checkpointWrites: [],
        warnings: discovery.warnings,
        metrics: {
          scannedSources: 0,
          importedSessions: 0,
          skippedRecords: 0,
        },
      };
    }

    const source = discovery.sources[0];
    const checkpoint = await context.storage.readCheckpoint(this.provider, source.id);
    const afterTimestamp = Number(checkpoint?.cursorValue ?? '0');
    const database = new DatabaseSync(source.path, { readOnly: true });
    const sessionRows = database.prepare(`
      SELECT id, directory, title, time_created, time_updated
      FROM session
      WHERE time_updated > ?
      ORDER BY time_updated ASC
      LIMIT ?
    `).all(afterTimestamp, context.limits.maxFilesPerPass) as unknown as OpenCodeSessionRow[];

    const sessions: CanonicalSessionSeed[] = [];
    let maxUpdated = afterTimestamp;
    let skippedRecords = 0;

    for (const row of sessionRows) {
      const messageRows = database.prepare(`
        SELECT data
        FROM message
        WHERE session_id = ?
        ORDER BY time_created ASC
      `).all(row.id) as unknown as OpenCodeMessageRow[];

      const parsed = this.parseSession(row, messageRows, context);
      sessions.push(parsed.session);
      skippedRecords += parsed.skippedRecords;
      maxUpdated = Math.max(maxUpdated, row.time_updated);
    }

    const checkpointWrites: ProviderCheckpoint[] =
      sessionRows.length > 0
        ? [
            {
              provider: this.provider,
              sourceId: source.id,
              cursorType: 'timestamp',
              cursorValue: String(maxUpdated),
              updatedAt: new Date().toISOString(),
            },
          ]
        : [];

    return {
      sessions,
      checkpointWrites,
      warnings: discovery.warnings,
      metrics: {
        scannedSources: 1,
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

  private parseSession(
    row: OpenCodeSessionRow,
    messageRows: OpenCodeMessageRow[],
    context: AdapterContext,
  ): { session: CanonicalSessionSeed; skippedRecords: number } {
    const messages: OpenCodeMessageData[] = [];
    let skippedRecords = 0;

    for (const messageRow of messageRows) {
      try {
        messages.push(JSON.parse(messageRow.data) as OpenCodeMessageData);
      } catch {
        skippedRecords += 1;
      }
    }

    const assistantMessages = messages.filter((message) => message.role === 'assistant');
    const latestAssistant = assistantMessages.at(-1);
    const model = latestAssistant?.modelID ?? null;
    const providerId = latestAssistant?.providerID ?? null;

    let inputTokens = 0;
    let outputTokens = 0;
    let reasoningTokens = 0;
    let cachedInputTokens = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;

    for (const message of assistantMessages) {
      inputTokens += message.tokens?.input ?? 0;
      outputTokens += message.tokens?.output ?? 0;
      reasoningTokens += message.tokens?.reasoning ?? 0;
      cachedInputTokens += message.tokens?.cache?.read ?? 0;
      totalTokens += message.tokens?.total ?? 0;
      totalCostUsd += typeof message.cost === 'number' ? message.cost : 0;
    }

    const cacheHitRate = totalTokens > 0 ? cachedInputTokens / totalTokens : null;
    const hasErrors = assistantMessages.some((message) => Boolean(message.error));
    const hasNativePricing = assistantMessages.some((message) => typeof message.cost === 'number');
    const title =
      row.title.startsWith('New session -')
        ? deriveBoundedTitle(row.directory.split('/').pop() ?? row.title)
        : deriveBoundedTitle(row.title);

    return {
      session: {
        provider: this.provider,
        providerSessionId: row.id,
        sourcePath: context.paths.opencodeRoot ?? `${process.env.HOME ?? ''}/.local/share/opencode/opencode.db`,
        projectPath: row.directory,
        startedAt: new Date(row.time_created).toISOString(),
        endedAt: new Date(row.time_updated).toISOString(),
        lastActivityAt: new Date(row.time_updated).toISOString(),
        durationMs: Math.max(0, row.time_updated - row.time_created),
        model,
        modelFamily: model ? model.split('/')[0] : providerId,
        title,
        messageCount: messages.length,
        toolCallCount: 0,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          cachedInput: cachedInputTokens,
          cachedWrite: 0,
          reasoning: reasoningTokens,
          total: totalTokens,
        },
        costs: {
          inputUsd: 0,
          outputUsd: 0,
          cacheReadUsd: 0,
          cacheWriteUsd: 0,
          totalUsd: totalCostUsd,
          pricingSnapshotId: hasNativePricing ? 'opencode-native-cost' : null,
        },
        cache: {
          hitRate: cacheHitRate,
          cacheEligibleTokens: cachedInputTokens,
        },
        resetWindow: null,
        metadata: {
          parserVersion: this.version,
          parserWarnings: [],
          providerMetadata: {
            assistantMessages: assistantMessages.length,
            hasErrors,
            providerId,
          },
          containsSensitiveText: false,
        },
      },
      skippedRecords,
    };
  }
}
