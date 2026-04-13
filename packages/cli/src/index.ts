import { doctorCommand } from "./commands/doctor.js";
import { providersCommand } from "./commands/providers.js";
import { summaryCommand } from "./commands/summary.js";
import { importCommand } from "./commands/import.js";
import { exportCommand } from "./commands/export.js";
import { compareSnapshotCommand } from "./commands/compare-snapshot.js";
import { isValidCommand, resolveCommandName } from "./commands/registry.js";
import type {
  ExtendedCliCommand,
  CommandContext,
  CommandResult,
  CommandError,
} from "./shared/types.js";

function printSessions(args: string[]): void {
  const filters = parseSessionFilters(args);
  if (!filters.ok) {
    process.stdout.write(`${filters.message}\n`);
    return;
  }

  const { TtmDatabase, TtmReadService } = require("@ttm/core");
  const { formatKeyValueLine, formatSessionRow } = require("./shared/output.js");

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const sessions = readService.listRecentSessions({
    limit: filters.limit,
    provider: filters.provider,
  });

  if (filters.provider) {
    process.stdout.write(
      `${formatKeyValueLine("provider filter", filters.provider)}\n`,
    );
  }
  process.stdout.write(`${formatKeyValueLine("limit", filters.limit)}\n`);

  for (const session of sessions) {
    process.stdout.write(`${formatSessionRow(session)}\n`);
  }
}

function printSessionAnalysis(sessionId: string | null): void {
  if (!sessionId) {
    process.stdout.write("usage: ttm analyze <session-id>\n");
    return;
  }

  const { TtmDatabase, TtmReadService } = require("@ttm/core");
  const { formatSessionDetailLines } = require("./shared/output.js");

  const database = new TtmDatabase();
  const readService = new TtmReadService(database);
  const session = readService.getSessionDetail(sessionId);
  if (!session) {
    process.stdout.write(`session not found: ${sessionId}\n`);
    return;
  }

  for (const line of formatSessionDetailLines(session)) {
    process.stdout.write(`${line}\n`);
  }

  if (session.pricingSnapshotId === null) {
    process.stdout.write(
      "pricing_note: total cost is not available because this model has no trusted pricing snapshot\n",
    );
  }
}

function runCommand(command: string, args: string[]): void {
  const context: CommandContext = { args };

  if (isValidCommand(command)) {
    const runHandler = async () => {
      switch (command) {
        case "doctor":
          return doctorCommand(context);
        case "providers":
          return providersCommand(context);
        case "summary":
          return summaryCommand(context);
        case "import":
          return importCommand(context);
        case "export":
          return exportCommand(context);
        case "compare-snapshot":
          return compareSnapshotCommand(context);
        default:
          return { ok: false, errors: ["Unknown command"] };
      }
    };

    runHandler().then((result) => {
      if ((result as any).ok) {
        (result as any).output.forEach((line: string) =>
          process.stdout.write(`${line}\n`),
        );
      } else {
        (result as any).errors.forEach((line: string) =>
          process.stderr.write(`${line}\n`),
        );
        process.exit(1);
      }
    });
    return;
  }

  if (command === "sessions") {
    printSessions(args);
    return;
  }

  if (command === "analyze") {
    printSessionAnalysis(args[0] ?? null);
    return;
  }

  printHelp();
}

function printHelp(): void {
  process.stdout.write(
    "usage: ttm <doctor|providers|import|summary|export|compare-snapshot|sessions|analyze>\n",
  );
  process.stdout.write("export args: [output-path] [--days <count>]\n");
  process.stdout.write(
    "compare-snapshot args: --provider <id> [output-path] [--reference-app <app>] [--ref-sessions <n>] [--ref-tokens <n>] [--ref-cost_usd <n>] [--ref-efficiency <n>] [--ref-reset-window <str>]\n",
  );
  process.stdout.write(
    "sessions flags: [--provider <provider>] [--limit <count>]\n",
  );
}

function parseSessionFilters(
  args: string[],
):
  | { ok: true; provider: string | undefined; limit: number }
  | { ok: false; message: string } {
  let provider: string | undefined;
  let limit = 15;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--provider") {
      const value = args[index + 1];
      if (!value) {
        return {
          ok: false,
          message:
            "usage: ttm sessions [--provider <provider>] [--limit <count>]",
        };
      }
      provider = value;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const value = args[index + 1];
      const parsed = value ? Number(value) : Number.NaN;
      if (!value || !Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        return {
          ok: false,
          message: "limit must be an integer between 1 and 100",
        };
      }
      limit = parsed;
      index += 1;
      continue;
    }

    return { ok: false, message: `unknown sessions flag: ${arg}` };
  }

  return { ok: true, provider, limit };
}

async function main(): Promise<void> {
  const command = (process.argv[2] ?? "doctor") as ExtendedCliCommand;
  runCommand(command, process.argv.slice(3));
}

main().catch((err) => {
  process.stderr.write(
    `fatal: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
