# Build Desktop DMG

Use either of these commands from the project root:

```bash
npm run desktop:installer
```

or:

```bash
bash ./build-desktop-dmg.sh
```

## What happens

- builds the TypeScript workspace used by the desktop app
- prepares the bundled desktop runtime
- builds the Tauri macOS app bundle
- creates the `.dmg` installer

## Output file

The generated installer is written here:

```bash
apps/desktop-tauri/src-tauri/target/release/bundle/dmg/Token Tracker_0.1.0_arm64.dmg
```

## Notes

- run these commands from the repo root
- this is for macOS only
- if `hdiutil` fails, run the command outside restricted sandboxing
- the underlying installer logic lives in `scripts/build-macos-installer.sh`
