/**
 * Safe storage for bot identity (seed + address).
 * Encrypts data at rest using AES-256-GCM with a PBKDF2-derived key.
 *
 * File format: [salt 16B] [nonce 12B] [ciphertext] [authTag 16B]
 * Plaintext is JSON: { seed, address }
 */
export interface StoredIdentity {
    seed: string;
    address: string;
}
export declare class SafeStorage {
    private filePath;
    constructor(dataDir: string, fileName?: string);
    /** Save seed and address encrypted with passphrase. */
    save(identity: StoredIdentity, passphrase: string): void;
    /** Load and decrypt identity. Returns null if file doesn't exist. */
    load(passphrase: string): StoredIdentity | null;
    /** Check if an identity file exists. */
    exists(): boolean;
    /** Delete the identity file. */
    delete(): void;
    getFilePath(): string;
}
//# sourceMappingURL=storage.d.ts.map