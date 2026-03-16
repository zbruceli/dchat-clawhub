#!/bin/bash
# ClawHub skill installer for dchat-clawhub
set -e

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SKILL_DIR"

echo "[dchat] Installing dependencies..."
npm install

echo "[dchat] Building TypeScript..."
npm run build

echo "[dchat] Generating bot identity..."
node dist/cli.js init

echo "[dchat] Installed successfully."
