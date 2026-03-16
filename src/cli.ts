#!/usr/bin/env node

import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { DchatBot } from "./bot.js";
import { NknClient } from "./client.js";
import { SafeStorage } from "./storage.js";
import type { IncomingMessage } from "./types.js";

const DATA_DIR = path.join(os.homedir(), ".dchat-clawhub");

/**
 * Load or create bot identity.
 * Uses SafeStorage (encrypted) as primary, falls back to legacy plaintext seed file.
 */
function loadOrCreateIdentity(dataDir: string): { seed: string; address: string; isNew: boolean } {
  fs.mkdirSync(dataDir, { recursive: true });
  const storage = new SafeStorage(dataDir);
  const passphrase = getPassphrase(dataDir);

  // Try SafeStorage first
  if (storage.exists()) {
    const identity = storage.load(passphrase);
    if (identity) return { ...identity, isNew: false };
  }

  // Migrate legacy plaintext seed file if present
  const legacySeedFile = path.join(dataDir, "seed");
  if (fs.existsSync(legacySeedFile)) {
    const seed = fs.readFileSync(legacySeedFile, "utf-8").trim();
    const address = NknClient.deriveAddress(seed);
    storage.save({ seed, address }, passphrase);
    fs.unlinkSync(legacySeedFile); // remove plaintext after migration
    return { seed, address, isNew: false };
  }

  // Generate fresh identity
  const seed = NknClient.generateSeed();
  const address = NknClient.deriveAddress(seed);
  storage.save({ seed, address }, passphrase);
  return { seed, address, isNew: true };
}

/**
 * Derive a machine-local passphrase for unattended bot use.
 * Combines hostname + username + a fixed salt — unique per machine/user but no manual input needed.
 */
function getPassphrase(dataDir: string): string {
  return `dchat:${os.hostname()}:${os.userInfo().username}:${dataDir}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`dchat-bot — Decentralized P2P bot communication over NKN

Usage:
  dchat-bot                     Start interactive mode
  dchat-bot --init              Generate identity and exit (no network needed)
  dchat-bot --seed <hex>        Use specific seed
  dchat-bot --data-dir <path>   Custom data directory
  dchat-bot --send <addr> <msg> Send a message and exit
  dchat-bot --send-file <addr> <path>  Send a file and exit
  dchat-bot --listen             Listen for messages (non-interactive)
  dchat-bot --address            Print address and exit

Data stored in: ${DATA_DIR}`);
    process.exit(0);
  }

  // Parse args
  let seed: string | undefined;
  let dataDir = DATA_DIR;
  let sendTarget: string | undefined;
  let sendMessage: string | undefined;
  let sendFilePath: string | undefined;
  let sendFileTarget: string | undefined;
  let listenMode = false;
  let addressOnly = false;
  let initOnly = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--seed":
        seed = args[++i];
        break;
      case "--data-dir":
        dataDir = args[++i];
        break;
      case "--send":
        sendTarget = args[++i];
        sendMessage = args[++i];
        break;
      case "--send-file":
        sendFileTarget = args[++i];
        sendFilePath = args[++i];
        break;
      case "--listen":
        listenMode = true;
        break;
      case "--address":
        addressOnly = true;
        break;
      case "--init":
        initOnly = true;
        break;
    }
  }

  // --init: generate identity offline and exit (no NKN connection)
  if (initOnly) {
    const identity = loadOrCreateIdentity(dataDir);
    if (identity.isNew) {
      console.log("Generated new bot identity.");
    } else {
      console.log("Bot identity already exists.");
    }
    console.log(`Address: ${identity.address}`);
    console.log(`Data dir: ${dataDir}`);
    process.exit(0);
  }

  // Resolve seed: explicit --seed flag, or load/create from SafeStorage
  let address: string | undefined;
  if (!seed) {
    const identity = loadOrCreateIdentity(dataDir);
    seed = identity.seed;
    address = identity.address;
    if (identity.isNew) {
      console.log("Generated new bot identity.");
    }
  }

  // --address: print derived address and exit (no NKN connection needed)
  if (addressOnly) {
    const addr = address ?? NknClient.deriveAddress(seed);
    console.log(addr);
    process.exit(0);
  }

  const bot = new DchatBot({ seed, dataDir });

  // Handle shutdown
  const shutdown = async () => {
    console.log("\nShutting down...");
    await bot.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("Connecting to NKN network...");
  const connectedAddress = await bot.start();
  console.log(`Bot address: ${connectedAddress}`);

  // One-shot send mode
  if (sendTarget && sendMessage) {
    const id = await bot.sendText(sendTarget, sendMessage);
    console.log(`Sent message ${id}`);
    await bot.stop();
    process.exit(0);
  }

  if (sendFileTarget && sendFilePath) {
    const id = await bot.sendFile(sendFileTarget, sendFilePath);
    console.log(`Sent file ${id}`);
    // Wait a moment for IPFS upload to complete
    await new Promise((r) => setTimeout(r, 2000));
    await bot.stop();
    process.exit(0);
  }

  // Message handler
  bot.on("message", (msg: IncomingMessage) => {
    const time = new Date(msg.timestamp).toISOString().substring(11, 19);
    const from = msg.from.substring(0, 16) + "...";
    switch (msg.contentType) {
      case "text":
      case "textExtension":
        console.log(`[${time}] ${from}: ${msg.content}`);
        break;
      case "image":
        console.log(`[${time}] ${from}: [image] ${msg.localFilePath ?? msg.content}`);
        break;
      case "audio":
        console.log(`[${time}] ${from}: [audio] ${msg.localFilePath ?? "(inline)"}`);
        break;
      case "file": {
        const fileName = msg.options?.fileName ?? "file";
        console.log(`[${time}] ${from}: [file: ${fileName}] ${msg.localFilePath ?? msg.content}`);
        break;
      }
    }
  });

  bot.on("receipt", (_from: string, _msgId: string) => {
    // Silent — bots don't need delivery noise
  });

  if (listenMode) {
    console.log("Listening for messages... (Ctrl+C to exit)");
    return;
  }

  // Interactive mode
  console.log("\nInteractive mode. Commands:");
  console.log("  /send <address> <message>     Send text");
  console.log("  /image <address> <path>       Send image");
  console.log("  /audio <address> <path>       Send audio");
  console.log("  /file <address> <path>        Send file");
  console.log("  /history <address>            Show message history");
  console.log("  /address                      Show bot address");
  console.log("  /quit                         Exit\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];

    try {
      switch (cmd) {
        case "/send": {
          const addr = parts[1];
          const text = parts.slice(2).join(" ");
          if (!addr || !text) {
            console.log("Usage: /send <address> <message>");
            break;
          }
          const id = await bot.sendText(addr, text);
          console.log(`Sent: ${id}`);
          break;
        }
        case "/image": {
          const addr = parts[1];
          const filePath = parts[2];
          if (!addr || !filePath) {
            console.log("Usage: /image <address> <path>");
            break;
          }
          const id = await bot.sendImage(addr, filePath);
          console.log(`Sent image: ${id}`);
          break;
        }
        case "/audio": {
          const addr = parts[1];
          const filePath = parts[2];
          if (!addr || !filePath) {
            console.log("Usage: /audio <address> <path>");
            break;
          }
          const id = await bot.sendAudio(addr, filePath);
          console.log(`Sent audio: ${id}`);
          break;
        }
        case "/file": {
          const addr = parts[1];
          const filePath = parts[2];
          if (!addr || !filePath) {
            console.log("Usage: /file <address> <path>");
            break;
          }
          const id = await bot.sendFile(addr, filePath);
          console.log(`Sent file: ${id}`);
          break;
        }
        case "/history": {
          const addr = parts[1];
          if (!addr) {
            console.log("Usage: /history <address>");
            break;
          }
          const msgs = bot.getMessages(addr);
          if (msgs.length === 0) {
            console.log("No messages.");
          } else {
            for (const m of msgs) {
              const dir = m.isOutbound ? "→" : "←";
              const time = new Date(m.createdAt).toISOString().substring(11, 19);
              const preview = m.content.length > 80 ? m.content.substring(0, 80) + "..." : m.content;
              console.log(`  ${dir} [${time}] (${m.contentType}) ${preview}`);
            }
          }
          break;
        }
        case "/address":
          console.log(bot.address);
          break;
        case "/quit":
        case "/exit":
          await shutdown();
          break;
        default:
          console.log(`Unknown command: ${cmd}`);
      }
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
    }

    rl.prompt();
  });

  rl.on("close", shutdown);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
