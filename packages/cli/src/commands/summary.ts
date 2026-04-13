import type { CommandHandler, CommandContext, CommandResult, CommandError } from '../shared/types.js';
import { success, error } from '../shared/utils.js';

const DESCRIPTION = 'Print a summary of all tracked sessions';

export const summaryCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  try {
    const core = await import('@ttm/core');
    const { formatKeyValueLine, formatSummaryRow } = await import('../shared/output.js');

    const database = new core.TtmDatabase();
    const readService = new core.TtmReadService(database);
    const summary = readService.getSummarySnapshot();

    const lines: string[] = [];
    lines.push(formatKeyValueLine('database', summary.databasePath || core.defaultDatabasePath()));
    lines.push(formatKeyValueLine('stored sessions', summary.sessionCount));

    for (const providerSummary of summary.providerSummaries) {
      lines.push(formatSummaryRow(providerSummary));
      if (providerSummary.unpricedSessions > 0) {
        lines.push(formatKeyValueLine('pricing warning', `${providerSummary.provider} has ${providerSummary.unpricedSessions} session(s) with unknown pricing`));
      }
    }

    return success(...lines);
  } catch (e) {
    return error(`summary command failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const help = DESCRIPTION;