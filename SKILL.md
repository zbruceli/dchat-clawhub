---
name: dchat
description: Decentralized P2P bot-to-bot messaging over NKN. Send and receive text, images, audio, and files without any centralized server. Private, encrypted, serverless.
user-invocable: true
metadata:
  openclaw:
    emoji: "\U0001F4AC"
    requires:
      bins:
        - node
---

# dchat — Decentralized P2P Messaging Skill

You have access to **dchat**, a decentralized peer-to-peer messaging system over the NKN relay network. Messages are end-to-end encrypted and require no centralized server, API keys, or accounts. Every bot gets a unique NKN address derived from a cryptographic seed.

This skill is wire-compatible with dchat Desktop and nMobile — bots can message human users and vice versa.

## When to Use

Use this skill when the user or another agent wants to:
- Send or receive messages to/from another bot or NKN user
- Transfer files, images, or audio to a peer
- Set up a listening bot that reacts to incoming messages
- Check message history with a peer
- Create or manage a bot identity (NKN wallet)

## How to Use

All commands go through the `dchat-bot` CLI at the project root. Always build first if not already built.

### Setup (first time only)

```bash
cd /path/to/dchat-clawhub && npm run build
```

### Get bot address

```bash
cd /path/to/dchat-clawhub && node dist/cli.js --address
```

This connects to NKN, prints the bot's address, and exits. The address is deterministic from the seed. A seed is auto-generated on first run and saved to `~/.dchat-clawhub/seed`.

### Send a text message

```bash
cd /path/to/dchat-clawhub && node dist/cli.js --send "<nkn-address>" "Hello from the bot!"
```

### Send a file

```bash
cd /path/to/dchat-clawhub && node dist/cli.js --send-file "<nkn-address>" "/path/to/file.pdf"
```

### Listen for incoming messages

```bash
cd /path/to/dchat-clawhub && node dist/cli.js --listen
```

This runs as a daemon, printing received messages to stdout. Parse the output to react to incoming messages:
- Text: `[HH:MM:SS] <sender>...: <message text>`
- Image: `[HH:MM:SS] <sender>...: [image] <local-path>`
- Audio: `[HH:MM:SS] <sender>...: [audio] <local-path>`
- File: `[HH:MM:SS] <sender>...: [file: <name>] <local-path>`

### Custom seed / data directory

```bash
cd /path/to/dchat-clawhub && node dist/cli.js --seed "<64-char-hex>" --data-dir "/custom/path" --address
```

### Programmatic usage (Node.js)

For advanced workflows, use the library directly:

```javascript
import { DchatBot, SafeStorage, NknClient } from "./dist/index.js";

// Create or load identity
const storage = new SafeStorage("./data");
let seed;
if (storage.exists()) {
  const id = storage.load("passphrase");
  seed = id.seed;
} else {
  seed = NknClient.generateSeed();
}

// Start bot
const bot = new DchatBot({ seed, dataDir: "./data" });
const address = await bot.start();

// Save identity
storage.save({ seed, address }, "passphrase");

// Listen
bot.on("message", (msg) => {
  console.log(`${msg.from}: ${msg.content}`);
});

// Send
await bot.sendText(targetAddress, "Hello!");
await bot.sendImage(targetAddress, "./photo.jpg");
await bot.sendFile(targetAddress, "./doc.pdf");

// History
const msgs = bot.getMessages(targetAddress, 50);

// Cleanup
await bot.stop();
```

## Key Concepts

- **NKN Address**: A 64-character hex public key. Each bot has a unique address derived from its seed. Example: `cb76d034e68d5e156114096a7a43ee3c43094b52143359117f87b0e91fb7a7e8`
- **Seed**: A 64-character hex Ed25519 private key. Whoever holds the seed controls the identity. Stored encrypted via `SafeStorage`.
- **Media Transfer**: Images, audio, and files are encrypted with AES-128-GCM, uploaded to IPFS, and the hash + key are sent over NKN. Recipients auto-download and decrypt.
- **Message History**: All sent/received messages are stored in a local SQLite database at `~/.dchat-clawhub/messages.db`.
- **Delivery Receipts**: The protocol supports delivery and read receipts automatically.

## Security

- All media encrypted with AES-128-GCM before upload to IPFS
- Identity encrypted at rest with AES-256-GCM + PBKDF2 (100K iterations)
- Seed file permissions set to 0600
- No centralized server — messages travel through NKN relay nodes
- SSRF protection on IPFS gateway connections

## Limitations

- NKN connection takes 1–5 seconds on first connect
- Offline messages are held by NKN relay nodes for up to 1 hour
- Max file size: 100 MB
- Requires internet access to reach NKN seed nodes
