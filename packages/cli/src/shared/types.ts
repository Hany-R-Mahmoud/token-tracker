export type CliCommand = 'doctor' | 'providers' | 'summary' | 'import' | 'export' | 'compare-snapshot';
export type ExtendedCliCommand = CliCommand | 'sessions' | 'analyze';

export interface CommandContext {
  readonly args: string[];
}

export interface CommandResult {
  readonly ok: true;
  readonly output: string[];
}

export interface CommandError {
  readonly ok: false;
  readonly errors: string[];
}

export type CommandHandler = (context: CommandContext) => CommandResult | CommandError | Promise<CommandResult | CommandError>;

export interface CommandModule {
  readonly execute: CommandHandler;
  readonly description?: string;
  readonly help?: string;
}