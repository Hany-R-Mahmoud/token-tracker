import type { CommandHandler, CommandContext, CommandResult, CommandError } from './types.js';

export function createCommand(handler: CommandHandler): CommandHandler {
  return handler;
}

export function createErrorResponse(message: string): CommandError {
  return { ok: false, errors: [message] };
}

export function createSuccessResponse(output: string[]): CommandResult {
  return { ok: true, output };
}

export function success(...lines: string[]): CommandResult {
  return { ok: true, output: lines };
}

export function error(...lines: string[]): CommandError {
  return { ok: false, errors: lines };
}

export function requireArgs(context: CommandContext, min: number, usage: string): CommandError | null {
  if (context.args.length < min) {
    return error(usage);
  }
  return null;
}