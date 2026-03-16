# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

dchat-clawhub is a headless, CLI-only bot-to-bot P2P communication library over the NKN (New Kind of Network) relay network. It's designed as a ClawHub skill for AI bots to communicate privately without centralized servers. Wire-compatible with dchat Desktop and nMobile.

## Commands

```bash
npm run build          # Compile TypeScript → dist/
npm run dev            # Watch mode compilation
npm run test           # Run all tests (vitest)
npm run test:watch     # Watch mode tests
npm run typecheck      # Type check without emitting
npm run start          # Run CLI bot (node dist/cli.js)
```

Run a single test file: `npx vitest run tests/crypto.test.ts`

## ClawHub Skill

This project is an OpenClaw/ClawHub-compatible skill. The `SKILL.md` in the project root defines the skill metadata and agent instructions. Key files:

- `SKILL.md` — Skill manifest (frontmatter + instructions for the agent)
- `install.sh` — Auto-installs deps and builds on first use

The skill name is `dchat` and is user-invocable as `/dchat`.

## Architecture

```
src/
  index.ts      — Library exports (public API)
  bot.ts        — DchatBot: main orchestrator, event emitter for messages
  client.ts     — NknClient: NKN MultiClient wrapper (connect, send, receive)
  crypto.ts     — AES-128-GCM encrypt/decrypt (nMobile-compatible wire format)
  ipfs.ts       — IpfsService: upload/download via IPFS HTTP API with gateway fallback
  media.ts      — MediaService: image/audio/file encrypt+upload, download+decrypt
  storage.ts    — SafeStorage: encrypted identity persistence (AES-256-GCM + PBKDF2)
  db.ts         — MessageDb: SQLite message store and peer tracking (better-sqlite3)
  types.ts      — All TypeScript types (MessageData, MessageOptions, etc.)
  cli.ts        — CLI entry point with interactive REPL and one-shot modes
```

### Key Design Patterns

- **DchatBot** is the single entry point — wraps NKN client, IPFS, media, and DB
- **Event-driven**: `bot.on("message", handler)` for incoming messages
- **nMobile wire compatibility**: MessageData JSON format, AES-128-GCM with nonce prepended, IPFS CID + encrypted key bytes
- **No GUI dependencies**: No Electron, no React, no sharp, no ffmpeg — pure Node.js
- **ESM modules** with `.js` extensions in imports (required by NodeNext resolution)

### NKN Message Protocol

Messages are JSON `MessageData` objects sent as strings over NKN:
- `id` (UUID), `contentType`, `content`, `options` (encryption keys, file metadata), `timestamp`
- Media: encrypted with AES-128-GCM, uploaded to IPFS, key sent in `options.ipfsEncryptKeyBytes` as `number[]`
- Receipts: `contentType: "receipt"` with `targetID` pointing to original message
- Audio: inline base64 in nMobile data-URI format `![audio](data:audio/x-aac;base64,...)`

### Data Storage

- SQLite database at `{dataDir}/messages.db` (WAL mode)
- Media cache at `{dataDir}/media-cache/`
- Identity seed at `{dataDir}/seed` (file permissions 0600)
- Default dataDir: `~/.dchat-clawhub`

## Reference Repository

The dchat Desktop app at `/Users/zhengli/code/vibe_coding/dchat` is the reference implementation for NKN messaging protocol, IPFS media handling, and AES-128-GCM encryption format.
