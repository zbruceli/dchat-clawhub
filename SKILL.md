---
name: dchat
description: Decentralized P2P bot-to-bot messaging over NKN. Send and receive text, images, audio, and files without any centralized server. Private, encrypted, serverless.
user-invocable: true
command-dispatch: tool
command-tool: bash
command-arg-mode: raw
metadata:
  openclaw:
    emoji: "\U0001F4AC"
    requires:
      bins:
        - node
---

# dchat — Decentralized P2P Messaging Skill

You have access to **dchat**, a decentralized peer-to-peer messaging system over the NKN relay network. Messages are end-to-end encrypted and require no centralized server, API keys, or accounts.

Wire-compatible with dchat Desktop and nMobile — bots can message human users and vice versa.

## Commands

All commands are available as `/dchat <command>` or via `./dchat <command>` in the skill directory.

### Identity (no network needed)

```bash
./dchat init                              # Generate bot identity (first time, auto-run at install)
./dchat address                           # Print bot's NKN address
```

### Messaging (connects to NKN)

```bash
./dchat send <address> Hello world!       # Send text message
./dchat send-image <address> ./photo.jpg  # Send image (encrypted, via IPFS)
./dchat send-audio <address> ./voice.aac  # Send audio file
./dchat send-file <address> ./report.pdf  # Send any file (encrypted, via IPFS)
```

### Receiving

```bash
./dchat listen                            # Listen for messages (daemon, Ctrl+C to stop)
```

Output format:
```
[HH:MM:SS] <sender-prefix>...: <text>
[HH:MM:SS] <sender-prefix>...: [image] /path/to/downloaded.jpg
[HH:MM:SS] <sender-prefix>...: [audio] /path/to/downloaded.aac
[HH:MM:SS] <sender-prefix>...: [file: report.pdf] /path/to/downloaded.pdf
```

### History (no network needed)

```bash
./dchat history <address>                 # Show last 50 messages with peer
./dchat history <address> 100             # Show last 100 messages
```

### Interactive REPL

```bash
./dchat interactive                       # Full interactive mode with /send /file etc.
```

### Options

```bash
./dchat --seed <64-char-hex> address      # Use specific seed
./dchat --data-dir /custom/path init      # Custom data directory
```

## When to Use

Use this skill when the user or another agent wants to:
- Send or receive messages to/from another bot or NKN user
- Transfer files, images, or audio to a peer
- Set up a listening bot that reacts to incoming messages
- Check message history with a peer
- Get the bot's NKN address to share with others

## Key Concepts

- **NKN Address**: 64-char hex public key. Each bot gets a unique address derived from its seed. Can be derived offline.
- **Seed**: 64-char hex Ed25519 private key. Auto-generated at install, saved encrypted to `~/.dchat-clawhub/identity.enc`.
- **Media**: Encrypted with AES-128-GCM, uploaded to IPFS, key sent over NKN. Recipients auto-download and decrypt.
- **History**: All messages stored in SQLite at `~/.dchat-clawhub/messages.db`.
- **Receipts**: Delivery and read receipts are automatic.

## Security

- AES-128-GCM encryption for all media before IPFS upload
- Identity encrypted at rest (AES-256-GCM + PBKDF2, 100K iterations, file permissions 0600)
- No centralized server — messages travel through NKN relay nodes
- SSRF protection: ad-hoc IPFS gateways from incoming messages are DNS-resolved and all IPs verified as public (rejects RFC 1918, loopback, link-local, ULA, IPv4-mapped IPv6)

## Limitations

- NKN connection takes 1–5 seconds on first connect
- Offline messages held by NKN relay nodes for up to 1 hour
- Max file size: 100 MB
- Requires internet access to reach NKN seed nodes
