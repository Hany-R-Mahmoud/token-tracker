import type { CliCommand } from './types.js';

export const COMMANDS: Record<CliCommand, string> = {
  doctor: 'DoctorCommand',
  providers: 'ProvidersCommand',
  summary: 'SummaryCommand',
  import: 'ImportCommand',
  export: 'ExportCommand',
  'compare-snapshot': 'CompareSnapshotCommand',
};

export function resolveCommandName(command: CliCommand): string {
  return COMMANDS[command];
}

export function isValidCommand(value: string): value is CliCommand {
  return value in COMMANDS;
}