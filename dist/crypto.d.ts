export interface EncryptResult {
    ciphertext: Buffer;
    key: Buffer;
    nonce: Buffer;
}
/**
 * Encrypt with AES-128-GCM, nonce prepended (nMobile convention).
 * Output: [nonce (12 bytes)] [encrypted data] [auth tag (16 bytes)]
 */
export declare function encrypt(plaintext: Buffer): EncryptResult;
/**
 * Decrypt AES-128-GCM with nonce prepended (nMobile convention).
 * Input: [nonce (12 bytes)] [encrypted data] [auth tag (16 bytes)]
 */
export declare function decrypt(data: Buffer, key: Buffer, nonceSize?: number): Buffer;
//# sourceMappingURL=crypto.d.ts.map