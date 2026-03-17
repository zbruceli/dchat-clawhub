import { IpfsService } from "./ipfs.js";
import type { MessageOptions } from "./types.js";
export interface MediaResult {
    content: string;
    options: MessageOptions;
    localFilePath: string;
}
export declare class MediaService {
    private cacheDir;
    private ipfs;
    constructor(ipfs: IpfsService, dataDir: string);
    /**
     * Process and upload an image file.
     * Bot-optimized: no thumbnail generation (no sharp dependency), sends full image only.
     * Still nMobile-compatible wire format.
     */
    uploadImage(filePath: string): Promise<MediaResult>;
    /**
     * Process and upload an audio file.
     * Sends as inline base64 in nMobile data-URI format for small files,
     * or via IPFS for larger ones.
     */
    uploadAudio(filePath: string, durationSeconds?: number): Promise<MediaResult>;
    /**
     * Process and upload a generic file.
     */
    uploadFile(filePath: string): Promise<MediaResult>;
    /**
     * Download and decrypt media from IPFS.
     * Returns local file path.
     */
    downloadMedia(ipfsHash: string, keyBytes: number[], nonceSize?: number, fileExt?: string, preferredIp?: string): Promise<string>;
    /**
     * Save inline audio (nMobile base64 data-URI format) to local cache.
     */
    saveInlineAudio(messageId: string, content: string, fileExt?: string): string;
    getCacheDir(): string;
}
//# sourceMappingURL=media.d.ts.map