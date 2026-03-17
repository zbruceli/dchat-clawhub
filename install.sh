#!/bin/bash
# ClawHub skill installer for dchat-clawhub
set -e

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SKILL_DIR"

echo "[dchat] Installing dependencies..."
npm install

if [ ! -f dist/cli.js ]; then
  echo "[dchat] Building TypeScript..."
  npm run build
fi

echo "[dchat] Generating bot identity..."
node dist/cli.js init

echo "[dchat] Installed successfully."
