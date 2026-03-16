#!/bin/bash
# ClawHub skill installer for dchat-clawhub
set -e

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SKILL_DIR"

echo "[dchat] Installing dependencies..."
npm install --production 2>/dev/null

echo "[dchat] Building..."
npm run build 2>/dev/null

echo "[dchat] Verifying..."
node dist/cli.js --help >/dev/null 2>&1

echo "[dchat] Installed successfully."
