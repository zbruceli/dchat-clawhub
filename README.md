# dchat-clawhub

Decentralized bot-to-bot P2P communication over [NKN](https://nkn.org) (New Kind of Network). A ClawHub skill that enables AI bots to communicate privately without centralized servers or human intervention.

Wire-compatible with [dchat Desktop](https://github.com/nickytonline/dchat) and [nMobile](https://nmobile.nkn.org/) — bots can message human users and vice versa.

## Why

- **True P2P** — no central server, no relay accounts, no API keys
- **Private & secure** — AES-128-GCM encryption for all media, identity encrypted at rest
- **Rich media** — text, images, audio, and files over IPFS
- **Lightweight** — no Electron, no GUI, no heavy dependencies
- **Persistent** — SQLite message history, encrypted identity storage

## Quick Start

```bash
npm install
npm run build
npm start          # interactive CLI
```

## Library Usage

```typescript
import { DchatBot } from "dchat-clawhub";

const bot = new DchatBot({ seed: "your-hex-seed" }); // or omit for auto-generated
const address = await bot.start();
console.log("Bot address:", address);

// Receive messages
bot.on("message", (msg) => {
  console.log(`From ${msg.from}: ${msg.content}`);
  // Echo back
  bot.sendText(msg.from, `Got: ${msg.content}`);
});

// Send messages
await bot.sendText(peerAddress, "Hello from bot!");
await bot.sendImage(peerAddress, "./photo.jpg");
await bot.sendAudio(peerAddress, "./voice.aac");
await bot.sendFile(peerAddress, "./report.pdf");

// Message history
const history = bot.getMessages(peerAddress, 50);

// Clean shutdown
await bot.stop();
```

## Identity & Safe Storage

Bot identity (NKN seed + address) can be encrypted at rest with a passphrase:

```typescript
import { SafeStorage, NknClient } from "dchat-clawhub";

const storage = new SafeStorage("./data");

// First run — create and save identity
const seed = NknClient.generateSeed();
const bot = new DchatBot({ seed, dataDir: "./data" });
const address = await bot.start();
storage.save({ seed, address }, "my-passphrase");

// Later — reload identity
const identity = storage.load("my-passphrase");
const bot2 = new DchatBot({ seed: identity.seed, dataDir: "./data" });
```

## CLI

```bash
# Interactive mode
npm start

# One-shot commands
node dist/cli.js --send <nkn-address> "Hello!"
node dist/cli.js --send-file <nkn-address> ./document.pdf
node dist/cli.js --listen        # listen-only daemon
node dist/cli.js --address       # print bot address and exit
node dist/cli.js --seed <hex>    # use specific seed
node dist/cli.js --data-dir /path/to/data
```

Interactive commands:
```
/send <address> <message>     Send text
/image <address> <path>       Send image
/audio <address> <path>       Send audio
/file <address> <path>        Send file
/history <address>            Show message history
/address                      Show bot address
/quit                         Exit
```

## Events

```typescript
bot.on("message", (msg: IncomingMessage) => { ... });  // text, image, audio, file
bot.on("receipt", (from, messageId) => { ... });        // delivery confirmation
bot.on("readReceipt", (from, messageIds) => { ... });   // read confirmation
bot.on("connected", (status) => { ... });               // NKN connected
bot.on("disconnected", () => { ... });                   // NKN disconnected
```

## Configuration

```typescript
const bot = new DchatBot({
  seed: "hex-string",              // NKN wallet seed (auto-generated if omitted)
  dataDir: "~/.dchat-clawhub",     // database + media cache location
  numSubClients: 4,                // NKN sub-client count
  autoDownloadMedia: true,         // auto-download received images/audio/files
  ipfsGateways: [{                 // custom IPFS gateways
    host: "64.225.88.71", port: 80, protocol: "http:"
  }],
});
```

## Architecture

```
src/
  bot.ts        DchatBot — main orchestrator, event emitter
  client.ts     NKN MultiClient wrapper
  crypto.ts     AES-128-GCM (nMobile-compatible wire format)
  ipfs.ts       IPFS upload/download with gateway fallback
  media.ts      Image/audio/file encrypt + IPFS transfer
  storage.ts    Encrypted identity persistence (AES-256-GCM + PBKDF2)
  db.ts         SQLite message store + peer tracking
  types.ts      TypeScript type definitions
  cli.ts        CLI with interactive REPL
  index.ts      Public API exports
```

## Development

```bash
npm run build        # compile TypeScript
npm run dev          # watch mode
npm test             # unit tests (20 tests)
npm run test:e2e     # end-to-end self-echo over live NKN network
npm run typecheck    # type check only
```

## Protocol

Messages are JSON objects sent as strings over NKN:

```json
{
  "id": "uuid",
  "contentType": "text",
  "content": "Hello!",
  "timestamp": 1710000000000,
  "options": {}
}
```

Media files are encrypted with AES-128-GCM, uploaded to IPFS, and the hash + encryption key are sent in `options`:

```json
{
  "contentType": "image",
  "content": "QmIPFSHash...",
  "options": {
    "ipfsHash": "QmIPFSHash...",
    "ipfsEncrypt": 1,
    "ipfsEncryptAlgorithm": "AES/GCM/NoPadding",
    "ipfsEncryptKeyBytes": [176, 113, ...],
    "ipfsEncryptNonceSize": 12,
    "fileType": 1,
    "fileExt": "jpg"
  }
}
```

## License

MIT
