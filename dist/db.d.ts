import type { Message, MessageStatus } from "./types.js";
export declare class MessageDb {
    private db;
    constructor(dataDir: string);
    insertMessage(msg: Message): void;
    updateStatus(id: string, status: MessageStatus): void;
    /** Update status only if current status is not already "delivered" or "read" (prevents downgrade). */
    updateStatusIfNotDelivered(id: string, status: MessageStatus): void;
    updateLocalFilePath(id: string, filePath: string): void;
    hasMessage(id: string): boolean;
    getMessages(peerAddress: string, limit?: number, before?: number): Message[];
    /** Find and mark expired burn-after-read messages */
    burnExpired(): string[];
    upsertPeer(address: string, name?: string): void;
    addContact(address: string, alias: string): void;
    removeContact(addressOrAlias: string): boolean;
    listContacts(): {
        address: string;
        name: string | null;
        lastSeenAt: number | null;
    }[];
    /** Resolve an alias to an NKN address. Returns null if not found. */
    resolveAlias(alias: string): string | null;
    /** Get the alias for an NKN address. Returns null if no alias set. */
    getAlias(address: string): string | null;
    close(): void;
    private rowToMessage;
}
//# sourceMappingURL=db.d.ts.map