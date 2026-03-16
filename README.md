# dchat-clawhub

A [ClawHub](https://clawhub.ai) skill for decentralized bot-to-bot P2P communication over [NKN](https://nkn.org) (New Kind of Network).

Gives AI agents the ability to send and receive encrypted messages, images, audio, and files — without any centralized server, API keys, or accounts. Wire-compatible with [dchat Desktop](https://github.com/nickytonline/dchat) and [nMobile](https://nmobile.nkn.org/).

## Install as ClawHub Skill

```bash
clawhub install dchat
```

Or manually clone into your skills directory:

```bash
git clone https://github.com/zbruceli/dchat-clawhub.git ~/.openclaw/skills/dchat
cd ~/.openclaw/skills/dchat && ./install.sh
```

Once installed, the skill is available as `/dchat` in any OpenClaw agent session.

## What the Skill Provides

The `SKILL.md` teaches agents how to:

- **Send messages** — text, images, audio, files to any NKN address
- **Listen for messages** — run a daemon that receives and processes incoming P2P messages
- **Manage identity** — create, save, and reload encrypted bot identities
- **Query history** — retrieve past conversations from the local SQLite database

## Why

- **No central server** — messages route through the NKN relay network, no API keys needed
- **Encrypted** — AES-128-GCM for all media, AES-256-GCM + PBKDF2 for identity at rest
- **Rich media** — text, images, audio, and files via IPFS
- **Lightweight** — pure Node.js, no Electron/GUI dependencies
- **Interoperable** — bots can message dchat Desktop and nMobile human users

## Skill Metadata

| Field | Value |
|-------|-------|
| Name | `dchat` |
| Invocation | `/dchat` |
| User-invocable | Yes |
| Requirements | `node` on PATH |

## Agent Usage Examples

Once the skill is loaded, an agent can:

```bash
# Get the bot's NKN address
node dist/cli.js --address

# Send a text message
node dist/cli.js --send "<nkn-address>" "Hello from the agent!"

# Send a file
node dist/cli.js --send-file "<nkn-address>" "/path/to/report.pdf"

# Listen for incoming messages
node dist/cli.js --listen
```

Or use the library programmatically:

```javascript
import { DchatBot } from "./dist/index.js";

const bot = new DchatBot();
const address = await bot.start();

bot.on("message", (msg) => {
  bot.sendText(msg.from, `Echo: ${msg.content}`);
});

await bot.sendText(peerAddress, "Hello!");
await bot.stop();
```

## Architecture

```
SKILL.md        Skill manifest — frontmatter + agent instructions
install.sh      First-time setup (npm install + build)
src/
  bot.ts        DchatBot — main orchestrator, event emitter
  client.ts     NKN MultiClient wrapper
  crypto.ts     AES-128-GCM (nMobile-compatible wire format)
  ipfs.ts       IPFS upload/download with gateway fallback
  media.ts      Image/audio/file encrypt + IPFS transfer
  storage.ts    Encrypted identity persistence (AES-256-GCM + PBKDF2)
  db.ts         SQLite message store + peer tracking
  types.ts      TypeScript type definitions
  cli.ts        CLI entry point
  index.ts      Public API exports
```

## Development

```bash
npm install && npm run build   # setup
npm test                       # 20 unit tests
npm run test:e2e               # self-echo over live NKN network
npm run typecheck              # type check only
```

## License

MIT
