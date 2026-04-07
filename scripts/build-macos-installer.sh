#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="Token Tracker.app"
VERSION="$(node -p "require('$ROOT_DIR/apps/desktop-tauri/package.json').version")"
ARCH="$(uname -m)"
TAURI_DIR="$ROOT_DIR/apps/desktop-tauri/src-tauri"
RELEASE_DIR="$TAURI_DIR/target/release"
BUNDLE_DIR="$RELEASE_DIR/bundle"
APP_PATH="$BUNDLE_DIR/macos/$APP_NAME"
STAGING_DIR="$BUNDLE_DIR/macos-installer"
DMG_NAME="Token Tracker_${VERSION}_${ARCH}.dmg"
DMG_PATH="$BUNDLE_DIR/dmg/$DMG_NAME"

echo "Building macOS app bundle..."
npm run build --workspace=@ttm/desktop-tauri -- --bundles app

if [[ ! -d "$APP_PATH" ]]; then
  echo "Expected app bundle at $APP_PATH but it was not created." >&2
  exit 1
fi

echo "Preparing installer staging directory..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"
cp -R "$APP_PATH" "$STAGING_DIR/$APP_NAME"
ln -sfn /Applications "$STAGING_DIR/Applications"

mkdir -p "$(dirname "$DMG_PATH")"
rm -f "$DMG_PATH"

echo "Creating DMG installer at $DMG_PATH..."
hdiutil create \
  -volname "Token Tracker" \
  -srcfolder "$STAGING_DIR" \
  -ov \
  -format UDZO \
  "$DMG_PATH"

echo "Installer ready: $DMG_PATH"
