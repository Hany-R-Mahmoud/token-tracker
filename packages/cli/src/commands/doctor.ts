import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';
import { success, error } from './utils.js';

const DESCRIPTION = 'Run diagnostic checks on all adapters and providers';

export const doctorCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  try {
    const core = await import('@ttm/core');
    const { formatKeyValueLine } = await import('../output.js');

    const database = new core.TtmDatabase();
    const adapters = [new core.CodexAdapter(), new core.OpenCodeAdapter(), new core.ClaudeAdapter()];
    const adapterProviders = new Set<string>(adapters.map((a: { provider: string }) => a.provider));

    const lines: string[] = [];
    lines.push(formatKeyValueLine('database', database.path || core.defaultDatabasePath()));

    for (const adapter of adapters) {
      const health = await adapter.healthCheck({
        storage: database,
        pricing: new core.StaticPricingReader(),
        clock: new Date(),
        paths: {},
        limits: {
          maxBytesPerFile: 1024 * 1024 * 8,
          maxFilesPerPass: 500,
        },
      });

      const entry = core.KNOWN_PROVIDERS.find((e: { provider: string }) => e.provider === adapter.provider);
      const strategyStatus = entry ? formatStrategyStatus(entry.strategyStatus) : adapter.provider;

      lines.push(formatKeyValueLine('provider', adapter.provider));
      lines.push(formatKeyValueLine('status', strategyStatus));
      lines.push(formatKeyValueLine('sources found', health.sourcesFound));
      lines.push(formatKeyValueLine('provider health', describeProviderHealth(health)));
      lines.push(formatKeyValueLine('issues', health.issues.length > 0 ? health.issues.join(', ') : 'none'));
    }

    for (const entry of core.KNOWN_PROVIDERS) {
      if (adapterProviders.has(entry.provider)) continue;
      lines.push(formatKeyValueLine('provider', entry.provider));
      lines.push(formatKeyValueLine('status', formatStrategyStatus(entry.strategyStatus)));
      if (entry.incidentStatus !== 'ok') {
        lines.push(formatKeyValueLine('incident', formatIncidentStatus(entry.incidentStatus)));
      }
      if (entry.incidentNote) {
        lines.push(formatKeyValueLine('incident note', entry.incidentNote));
      }
      lines.push(formatKeyValueLine('note', entry.note));
    }

    return success(...lines);
  } catch (e) {
    return error(`doctor command failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

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
    case 'validated': return 'validated';
    case 'strategy_pending': return 'strategy pending';
    case 'experimental': return 'experimental';
    case 'unavailable': return 'unavailable';
    default: return status;
  }
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

export const help = DESCRIPTION;