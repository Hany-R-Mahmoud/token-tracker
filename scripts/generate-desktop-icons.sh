#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICON_DIR="$ROOT_DIR/apps/desktop-tauri/src-tauri/icons"
SOURCE_SVG="$ICON_DIR/refracted-token.svg"
TMP_DIR="/tmp/refracted-token-iconset-$$"
ICONSET_DIR="$TMP_DIR/refracted-token.iconset"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$ICONSET_DIR"

qlmanage -t -s 1024 -o "$TMP_DIR" "$SOURCE_SVG" >/dev/null 2>&1
BASE_PNG="$(find "$TMP_DIR" -name '*.png' | head -n 1)"

if [ -z "$BASE_PNG" ]; then
  echo "Failed to rasterize $SOURCE_SVG" >&2
  exit 1
fi

generate_png() {
  local size="$1"
  local output="$2"
  local temp_output="$TMP_DIR/$(basename "$output")"
  sips -z "$size" "$size" "$BASE_PNG" --out "$temp_output" >/dev/null
  cp "$temp_output" "$output"
}

generate_png 32 "$ICON_DIR/32x32.png"
generate_png 128 "$ICON_DIR/128x128.png"
generate_png 256 "$ICON_DIR/128x128@2x.png"
generate_png 30 "$ICON_DIR/Square30x30Logo.png"
generate_png 44 "$ICON_DIR/Square44x44Logo.png"
generate_png 71 "$ICON_DIR/Square71x71Logo.png"
generate_png 89 "$ICON_DIR/Square89x89Logo.png"
generate_png 107 "$ICON_DIR/Square107x107Logo.png"
generate_png 142 "$ICON_DIR/Square142x142Logo.png"
generate_png 150 "$ICON_DIR/Square150x150Logo.png"
generate_png 284 "$ICON_DIR/Square284x284Logo.png"
generate_png 310 "$ICON_DIR/Square310x310Logo.png"
generate_png 50 "$ICON_DIR/StoreLogo.png"
generate_png 512 "$ICON_DIR/icon.png"

generate_png 16 "$ICONSET_DIR/icon_16x16.png"
generate_png 32 "$ICONSET_DIR/icon_16x16@2x.png"
generate_png 32 "$ICONSET_DIR/icon_32x32.png"
generate_png 64 "$ICONSET_DIR/icon_32x32@2x.png"
generate_png 128 "$ICONSET_DIR/icon_128x128.png"
generate_png 256 "$ICONSET_DIR/icon_128x128@2x.png"
generate_png 256 "$ICONSET_DIR/icon_256x256.png"
generate_png 512 "$ICONSET_DIR/icon_256x256@2x.png"
generate_png 512 "$ICONSET_DIR/icon_512x512.png"
cp "$BASE_PNG" "$ICONSET_DIR/icon_512x512@2x.png"

iconutil -c icns "$ICONSET_DIR" -o "$TMP_DIR/icon.icns"
cp "$TMP_DIR/icon.icns" "$ICON_DIR/icon.icns"
python3 - <<'PY' "$TMP_DIR/icon.png" "$TMP_DIR/icon.ico"
from pathlib import Path
import struct
import sys

png_path = Path(sys.argv[1])
ico_path = Path(sys.argv[2])
png_bytes = png_path.read_bytes()

# ICO header with one PNG-backed image entry.
header = struct.pack("<HHH", 0, 1, 1)
entry = struct.pack(
    "<BBBBHHII",
    0,   # width: 0 means 256 px
    0,   # height: 0 means 256 px
    0,   # palette colors
    0,   # reserved
    1,   # color planes
    32,  # bits per pixel
    len(png_bytes),
    6 + 16,
)
ico_path.write_bytes(header + entry + png_bytes)
PY
cp "$TMP_DIR/icon.ico" "$ICON_DIR/icon.ico"

echo "Desktop icons regenerated from $SOURCE_SVG"
