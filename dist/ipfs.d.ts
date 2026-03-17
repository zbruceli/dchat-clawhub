import type { IpfsGateway } from "./types.js";
export declare class IpfsService {
    private gateways;
    constructor(gateways?: IpfsGateway[]);
    getPrimaryIp(): string;
    upload(data: Buffer, fileName: string): Promise<string>;
    download(ipfsHash: string, preferredIp?: string): Promise<Buffer>;
    /**
     * Check if an IP address is private/reserved (RFC 1918, loopback, link-local, etc.).
     * Handles both IPv4 and IPv6.
     */
    private isPrivateOrReservedIp;
    /**
     * Resolve a hostname to IP addresses and check that none are private/reserved.
     * Returns true if the host is safe to connect to (all resolved IPs are public).
     */
    private isPublicHost;
    private orderGateways;
    private uploadToGateway;
    private downloadFromGateway;
}
//# sourceMappingURL=ipfs.d.ts.map