import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';
import { success, error } from './utils.js';

const DESCRIPTION = 'Import session data from all adapters';

export const importCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  try {
    const core = await import('@ttm/core');
    const { formatKeyValueLine } = await import('../output.js');

    const database = new core.TtmDatabase();
    const adapters = [new core.CodexAdapter(), new core.OpenCodeAdapter(), new core.ClaudeAdapter()];
    let importedSessions = 0;
    let scannedSources = 0;
    const warnings = new Set<string>();

    for (const adapter of adapters) {
      const result = await adapter.import({
        storage: database,
        pricing: new core.StaticPricingReader(),
        clock: new Date(),
        paths: {},
        limits: {
          maxBytesPerFile: 1024 * 1024 * 8,
          maxFilesPerPass: 250,
        },
      });

      for (const seed of result.sessions) {
        database.upsertSession(core.enrichSession(seed));
      }

      await database.writeCheckpoints(result.checkpointWrites);
      importedSessions += result.sessions.length;
      scannedSources += result.metrics.scannedSources;
      for (const warning of result.warnings) {
        warnings.add(warning);
      }
    }

    const lines: string[] = [];
    lines.push(formatKeyValueLine('database', database.path || core.defaultDatabasePath()));
    lines.push(formatKeyValueLine('imported sessions', importedSessions));
    lines.push(formatKeyValueLine('scanned sources', scannedSources));
    if (warnings.size > 0) {
      lines.push(formatKeyValueLine('warnings', Array.from(warnings).join(', ')));
    }

    return success(...lines);
  } catch (e) {
    return error(`import command failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const help = DESCRIPTION;