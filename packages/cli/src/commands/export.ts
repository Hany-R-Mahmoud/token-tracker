import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';
import { success, error } from './utils.js';

const DESCRIPTION = 'Export session data to JSON';

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

interface ExportValidationResult {
  valid: boolean;
  path: string;
  error?: string;
}

function validateExportPath(path: string, cwd: string): ExportValidationResult {
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
  const isRelative = !isAbsolute && /^[a-zA-Z0-9_\-\.\/]+$/.test(normalizedPath);
  
  if (!isAbsolute && !isRelative) {
    return { valid: false, path: '', error: 'Invalid path format' };
  }

  const resolved = isAbsolute ? normalizedPath : cwd + '/' + normalizedPath;
  
  return { valid: true, path: resolved };
}

export const exportCommand: CommandHandler = async (context: CommandContext): Promise<CommandResult | CommandError> => {
  const parsed = parseExportArgs(context.args);
  if (!parsed.ok) {
    return error(parsed.message);
  }

  const validated = validateExportPath(parsed.outputPath, process.cwd());
  if (!validated.valid) {
    return error(`error: ${validated.error}`);
  }

  try {
    const { writeFileSync } = await import('node:fs');
    const core = await import('@ttm/core');
    const { formatKeyValueLine } = await import('../output.js');

    const database = new core.TtmDatabase();
    const readService = new core.TtmReadService(database);
    const bundle = readService.buildExportBundle(parsed.days);

    writeFileSync(validated.path, JSON.stringify(bundle, null, 2), 'utf8');

    const lines: string[] = [];
    lines.push(formatKeyValueLine('export path', validated.path));
    lines.push(formatKeyValueLine('window days', parsed.days));
    lines.push(formatKeyValueLine('sessions exported', bundle.sessionCount));
    lines.push(formatKeyValueLine('providers', bundle.providerSummaries.length));
    lines.push(formatKeyValueLine('models', bundle.modelSummaries.length));
    lines.push(formatKeyValueLine('daily buckets', bundle.dailyBuckets.length));
    lines.push(formatKeyValueLine('raw prompts included', 'false'));
    lines.push(formatKeyValueLine('raw transcripts included', 'false'));

    return success(...lines);
  } catch (e) {
    return error(`export failed: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const help = DESCRIPTION;