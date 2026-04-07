#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/apps/desktop-tauri/runtime"
NODE_BIN="$(which node)"

if [[ -z "$NODE_BIN" || ! -x "$NODE_BIN" ]]; then
  echo "Unable to find an executable Node.js binary for desktop runtime bundling." >&2
  exit 1
fi

rm -rf "$RUNTIME_DIR"

mkdir -p "$RUNTIME_DIR/apps/desktop"
mkdir -p "$RUNTIME_DIR/node_modules/@ttm/core"
mkdir -p "$RUNTIME_DIR/bin"

cp -R "$ROOT_DIR/apps/desktop/dist" "$RUNTIME_DIR/apps/desktop/dist"
cp "$ROOT_DIR/apps/desktop/package.json" "$RUNTIME_DIR/apps/desktop/package.json"

cp -R "$ROOT_DIR/packages/core/dist" "$RUNTIME_DIR/node_modules/@ttm/core/dist"
cp "$ROOT_DIR/packages/core/package.json" "$RUNTIME_DIR/node_modules/@ttm/core/package.json"

cp "$NODE_BIN" "$RUNTIME_DIR/bin/node"
chmod +x "$RUNTIME_DIR/bin/node"

echo "Prepared bundled desktop runtime at $RUNTIME_DIR"
