import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';
import { success, error } from './utils.js';

const DESCRIPTION = 'List known providers and their status';

export const providersCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  try {
    const core = await import('@ttm/core');

    const formatIncidentStatus = (status: string): string => {
      switch (status) {
        case 'ok': return 'ok';
        case 'degraded': return 'degraded';
        case 'incident': return 'incident';
        case 'auth_needed': return 'auth needed';
        case 'maintenance': return 'maintenance';
        default: return status;
      }
    };

    const formatStrategyStatus = (status: string): string => {
      switch (status) {
        case 'validated': return 'validated';
        case 'strategy_pending': return 'strategy pending';
        case 'experimental': return 'experimental';
        case 'unavailable': return 'unavailable';
        default: return status;
      }
    };

    const lines: string[] = ['known providers:'];
    for (const entry of core.KNOWN_PROVIDERS) {
      const incident = entry.incidentStatus !== 'ok' ? ` [${formatIncidentStatus(entry.incidentStatus)}]` : '';
      lines.push(`  ${entry.provider}: ${formatStrategyStatus(entry.strategyStatus)}${incident} — ${entry.note}`);
    }

    return success(...lines);
  } catch (e) {
    return error(`providers command failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const help = DESCRIPTION;