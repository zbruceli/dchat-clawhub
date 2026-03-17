import { EventEmitter } from "events";
import type { ClientStatus } from "./types.js";
export declare class NknClient extends EventEmitter {
    private client;
    private status;
    private numSubClients;
    constructor(numSubClients?: number);
    getStatus(): ClientStatus;
    getAddress(): string | undefined;
    /**
     * Generate a new random NKN seed (hex-encoded Ed25519 private key).
     */
    static generateSeed(): string;
    /**
     * Derive the NKN address from a seed without connecting to the network.
     */
    static deriveAddress(seed: string): string;
    connect(seed: string): Promise<ClientStatus>;
    disconnect(): Promise<void>;
    send(dest: string, data: string): Promise<void>;
    sendNoReply(dest: string, data: string): void;
    private assertConnected;
    private updateStatus;
}
//# sourceMappingURL=client.d.ts.map