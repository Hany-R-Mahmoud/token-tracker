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

interface ClaudeJsonlRecord {
  type?: string;
  timestamp?: string;
  message?: {
    role?: string;
    content?: string | unknown[];
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
  cwd?: string;
  session_id?: string;
  sessionId?: string;
  parent_id?: string;
  version?: string;
  branch?: string;
  is_synthetic?: boolean;
}

const NOISE_FILES = ['skill-injections.jsonl', 'memory-system.jsonl'];

export class ClaudeAdapter implements ProviderAdapter {
  public readonly provider = 'claude' as const;
  public readonly version = '0.1.0';

  public async discover(context: AdapterContext): Promise<DiscoveryResult> {
    const rootPath = context.paths.claudeRoot ?? `${process.env.HOME ?? ''}/.claude/projects`;
    const sources: DiscoveredSource[] = [];
    const warnings: string[] = [];

    try {
      for await (const entry of glob(`${rootPath}/**/*.jsonl`)) {
        if (sources.length >= context.limits.maxFilesPerPass) {
          break;
        }
        if (extname(entry) !== '.jsonl') {
          continue;
        }
        const basename = entry.split('/').pop() ?? '';
        if (NOISE_FILES.some(noise => entry.includes(noise))) {
          warnings.push(`excluding_noise_file: ${basename}`);
          continue;
        }
        sources.push({
          id: entry,
          path: entry,
          kind: 'file',
        });
      }
    } catch {
      warnings.push('claude_source_not_found');
    }

    return {
      sources,
      warnings: sources.length > 0 ? warnings : ['claude_source_not_found'],
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
    const hasSources = discovery.sources.length > 0;

    return {
      status: hasSources ? 'ok' : 'degraded',
      sourcesFound: discovery.sources.length,
      lastSuccessfulImportAt: null,
      issues: discovery.warnings.filter(w => w !== 'claude_source_not_found'),
    };
  }

  private async parseFile(
    filePath: string,
    content: string,
    context: AdapterContext
  ): Promise<{ sessions: CanonicalSessionSeed[]; skippedRecords: number; warnings: string[] }> {
    const lines = content.split('\n').filter(line => line.trim());
    const records: ClaudeJsonlRecord[] = [];

    for (const line of lines) {
      try {
        records.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }

    if (records.length === 0) {
      return { sessions: [], skippedRecords: 0, warnings: [] };
    }

    const hasUserMessage = records.some(r => r.type === 'user' || r.message?.role === 'user');
    const hasAssistantMessage = records.some(r => r.type === 'assistant' || r.message?.role === 'assistant');

    if (!hasUserMessage || !hasAssistantMessage) {
      return {
        sessions: [],
        skippedRecords: records.length,
        warnings: [`no_valid_conversation: ${filePath.split('/').pop()}`],
      };
    }

    const sessionId = this.deriveSessionId(records);
    const startTime = this.deriveStartTime(records);
    const lastActivity = this.deriveLastActivity(records);
    const projectPath = this.deriveProjectPath(records);
    const { model, modelFamily } = this.deriveModel(records);
    const title = this.deriveTitle(records);
    const { messageCount, toolCallCount } = this.deriveCounts(records);
    const { inputTokens, outputTokens, cachedInput, cachedWrite, reasoningTokens, totalTokens } = this.deriveTokens(records);
    const pricing = await context.pricing.getModelPricing(model);

    const session: CanonicalSessionSeed = {
      provider: this.provider,
      providerSessionId: sessionId,
      sourcePath: filePath,
      projectPath,
      startedAt: startTime,
      lastActivityAt: lastActivity,
      endedAt: lastActivity,
      durationMs: lastActivity && startTime ? new Date(lastActivity).getTime() - new Date(startTime).getTime() : null,
      model,
      modelFamily,
      title,
      messageCount,
      toolCallCount,
      tokens: {
        input: inputTokens,
        output: outputTokens,
        cachedInput,
        cachedWrite,
        reasoning: reasoningTokens,
        total: totalTokens,
      },
      costs: {
        inputUsd: pricing.inputPerMillionUsd !== null ? (inputTokens / 1_000_000) * pricing.inputPerMillionUsd : 0,
        outputUsd: pricing.outputPerMillionUsd !== null ? (outputTokens / 1_000_000) * pricing.outputPerMillionUsd : 0,
        cacheReadUsd: pricing.cacheReadPerMillionUsd !== null ? (cachedInput / 1_000_000) * pricing.cacheReadPerMillionUsd : 0,
        cacheWriteUsd: pricing.cacheWritePerMillionUsd !== null ? (cachedWrite / 1_000_000) * pricing.cacheWritePerMillionUsd : 0,
        totalUsd: 0,
        pricingSnapshotId: pricing.pricingSnapshotId,
      },
      cache: {
        hitRate: cachedInput > 0 && totalTokens > 0 ? cachedInput / totalTokens : 0,
        cacheEligibleTokens: inputTokens + outputTokens,
      },
      metadata: {
        parserVersion: '0.1.0',
        parserWarnings: [],
        containsSensitiveText: false,
        providerMetadata: {
          claudeVersion: this.deriveClaudeVersion(records),
          gitBranch: this.deriveGitBranch(records),
          syntheticRecordCount: records.filter(r => r.is_synthetic).length,
        },
      },
      resetWindow: null,
    };

    session.costs.totalUsd = session.costs.inputUsd + session.costs.outputUsd + session.costs.cacheReadUsd + session.costs.cacheWriteUsd;

    return { sessions: [session], skippedRecords: 0, warnings: [] };
  }

  private deriveSessionId(records: ClaudeJsonlRecord[]): string {
    const sessionIdRecord = records.find(r => r.session_id || r.sessionId);
    const id = sessionIdRecord?.session_id ?? sessionIdRecord?.sessionId ?? null;
    if (id) return id;
    const fileName = records[0]?.session_id ?? null;
    if (fileName) return fileName;
    return `claude-${Date.now()}`;
  }

  private deriveStartTime(records: ClaudeJsonlRecord[]): string {
    const timestampRecord = records.find(r => r.timestamp);
    if (timestampRecord?.timestamp) {
      return timestampRecord.timestamp;
    }
    return new Date().toISOString();
  }

  private deriveLastActivity(records: ClaudeJsonlRecord[]): string {
    const reversed = [...records].reverse();
    const lastRecord = reversed.find(r => r.timestamp);
    return lastRecord?.timestamp ?? new Date().toISOString();
  }

  private deriveProjectPath(records: ClaudeJsonlRecord[]): string | null {
    const cwdRecord = records.find(r => r.cwd);
    return cwdRecord?.cwd ?? null;
  }

  private deriveModel(records: ClaudeJsonlRecord[]): { model: string | null; modelFamily: string | null } {
    const assistantRecords = records.filter(r => {
      const isAssistant = r.type === 'assistant' || r.message?.role === 'assistant';
      const isSynthetic = r.is_synthetic || r.message?.model === '<synthetic>';
      return isAssistant && !isSynthetic;
    });
    const modelRecord = assistantRecords.reverse().find(r => r.message?.model && r.message.model !== '<synthetic>');
    
    if (!modelRecord?.message?.model) {
      return { model: null, modelFamily: null };
    }

    const model = modelRecord.message.model;
    const modelFamily = model.toLowerCase().split('-')[0];

    return { model, modelFamily };
  }

  private deriveTitle(records: ClaudeJsonlRecord[]): string | null {
    const userRecords = records.filter(r => r.type === 'user' || r.message?.role === 'user');
    for (const record of userRecords) {
      const content = record.message?.content;
      if (typeof content === 'string' && isUsefulPromptText(content)) {
        return deriveBoundedTitle(content);
      }
    }
    return null;
  }

  private deriveCounts(records: ClaudeJsonlRecord[]): { messageCount: number; toolCallCount: number } {
    const userCount = records.filter(r => r.type === 'user' || r.message?.role === 'user').length;
    const assistantCount = records.filter(r => r.type === 'assistant' || r.message?.role === 'assistant').length;
    let toolCallCount = 0;
    for (const record of records) {
      if (record.type === 'tool_use') {
        toolCallCount++;
      } else if (record.message?.content && Array.isArray(record.message.content)) {
        const hasToolUse = record.message.content.some((c: unknown) => typeof c === 'object' && c !== null && (c as { type?: string }).type === 'tool_use');
        if (hasToolUse) toolCallCount++;
      }
    }

    return {
      messageCount: userCount + assistantCount,
      toolCallCount,
    };
  }

  private deriveTokens(records: ClaudeJsonlRecord[]): {
    inputTokens: number;
    outputTokens: number;
    cachedInput: number;
    cachedWrite: number;
    reasoningTokens: number;
    totalTokens: number;
  } {
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedInput = 0;
    let cachedWrite = 0;

    const assistantRecords = records.filter(r => r.type === 'assistant' || r.message?.role === 'assistant');
    
    for (const record of assistantRecords) {
      const usage = record.message?.usage;
      if (usage) {
        inputTokens += usage.input_tokens ?? 0;
        outputTokens += usage.output_tokens ?? 0;
        cachedInput += usage.cache_read_input_tokens ?? 0;
        cachedWrite += usage.cache_creation_input_tokens ?? 0;
      }
    }

    const totalTokens = inputTokens + outputTokens + cachedInput + cachedWrite;

    return {
      inputTokens,
      outputTokens,
      cachedInput,
      cachedWrite,
      reasoningTokens: 0,
      totalTokens,
    };
  }

  private deriveClaudeVersion(records: ClaudeJsonlRecord[]): string | null {
    const versionRecord = records.find(r => r.version);
    return versionRecord?.version ?? null;
  }

  private deriveGitBranch(records: ClaudeJsonlRecord[]): string | null {
    const branchRecord = records.find(r => r.branch);
    return branchRecord?.branch ?? null;
  }
}