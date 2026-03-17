import crypto from "crypto";
const ALGORITHM = "aes-128-gcm";
const KEY_BYTES = 16;
const NONCE_BYTES = 12;
const AUTH_TAG_BYTES = 16;
/**
 * Encrypt with AES-128-GCM, nonce prepended (nMobile convention).
 * Output: [nonce (12 bytes)] [encrypted data] [auth tag (16 bytes)]
 */
export function encrypt(plaintext) {
    const key = crypto.randomBytes(KEY_BYTES);
    const nonce = crypto.randomBytes(NONCE_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, nonce);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const ciphertext = Buffer.concat([nonce, encrypted, authTag]);
    return { ciphertext, key, nonce };
}
/**
 * Decrypt AES-128-GCM with nonce prepended (nMobile convention).
 * Input: [nonce (12 bytes)] [encrypted data] [auth tag (16 bytes)]
 */
export function decrypt(data, key, nonceSize = NONCE_BYTES) {
    const nonce = data.subarray(0, nonceSize);
    const ciphertextWithTag = data.subarray(nonceSize);
    const encrypted = ciphertextWithTag.subarray(0, ciphertextWithTag.length - AUTH_TAG_BYTES);
    const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - AUTH_TAG_BYTES);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, nonce);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
//# sourceMappingURL=crypto.js.map