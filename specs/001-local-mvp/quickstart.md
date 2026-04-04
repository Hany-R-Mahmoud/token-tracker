# Quickstart: Local-First MVP Completion

## Verify Current Baseline

```bash
npm run typecheck
npm run build
node packages/cli/dist/index.js doctor
node packages/cli/dist/index.js import
node packages/cli/dist/index.js summary
```

## Verify Provider Expansion Safely

1. Validate the next provider source exists locally.
2. Implement or update the adapter.
3. Re-run:

```bash
node packages/cli/dist/index.js import
node packages/cli/dist/index.js summary
node packages/cli/dist/index.js sessions
```

## Verify Desktop Shell

1. Launch the desktop app shell.
2. Confirm it renders:
   - total sessions
   - provider summaries
   - recent sessions
3. Confirm it reads only from the local SQLite store.
