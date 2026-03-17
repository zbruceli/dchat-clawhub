import { EventEmitter } from "events";
import type { BotConfig, Message } from "./types.js";
/**
 * DchatBot — headless, CLI-friendly P2P bot over NKN.
 *
 * Events:
 *   "message"      — (msg: IncomingMessage) — text, image, audio, or file received
 *   "receipt"       — (from: string, messageId: string) — delivery receipt
 *   "readReceipt"   — (from: string, messageIds: string[]) — read receipt
 *   "connected"     — (status: ClientStatus) — NKN client connected
 *   "disconnected"  — () — NKN client disconnected
 */
export declare class DchatBot extends EventEmitter {
    private nkn;
    private ipfs;
    private media;
    private db;
    private config;
    private seed;
    private burnTimer;
    constructor(config?: BotConfig);
    /** Connect to NKN network. Returns bot's NKN address. */
    start(): Promise<string>;
    /** Disconnect and clean up. */
    stop(): Promise<void>;
    /** Get the bot's NKN address (available after start). */
    get address(): string | undefined;
    /** Get the seed (for persistence). */
    getSeed(): string;
    /**
     * Send a text message (fire-and-forget). Returns message ID.
     * Use for long-running bots. Delivery confirmation arrives via receipt events.
     */
    sendText(to: string, text: string): string;
    /**
     * Send a text message and wait for NKN network to accept it.
     * Use for one-shot CLI sends where the process exits immediately after.
     * Returns message ID. Does NOT wait for recipient ACK — only for relay dispatch.
     * If the recipient is offline, the message is queued by NKN relay nodes.
     */
    sendTextAwait(to: string, text: string): Promise<string>;
    /** Send an image file. Returns message ID. */
    sendImage(to: string, filePath: string): Promise<string>;
    /** Send an audio file. Returns message ID. */
    sendAudio(to: string, filePath: string, durationSeconds?: number): Promise<string>;
    /** Send a generic file. Returns message ID. */
    sendFile(to: string, filePath: string): Promise<string>;
    /** Send a delivery receipt for a received message. */
    sendReceipt(to: string, messageId: string): void;
    /** Send read receipts for received messages. */
    sendReadReceipt(to: string, messageIds: string[]): void;
    /** Get message history with a peer. */
    getMessages(peerAddress: string, limit?: number, before?: number): Message[];
    private buildMessage;
    private sendAndStore;
    private sendAndStoreNoReply;
    private storeOutbound;
    private handleIncoming;
    private downloadMediaFromOptions;
    private startBurnScheduler;
    private stopBurnScheduler;
}
//# sourceMappingURL=bot.d.ts.map