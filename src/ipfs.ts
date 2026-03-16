import FormData from "form-data";
import https from "https";
import http from "http";
import type { IpfsGateway } from "./types.js";

const DEFAULT_GATEWAYS: IpfsGateway[] = [
  { host: "64.225.88.71", port: 80, protocol: "http:" }, // nMobile self-hosted
];

export class IpfsService {
  private gateways: IpfsGateway[];

  constructor(gateways?: IpfsGateway[]) {
    this.gateways = gateways?.length ? gateways : DEFAULT_GATEWAYS;
  }

  getPrimaryIp(): string {
    return this.gateways[0]?.host ?? "64.225.88.71";
  }

  async upload(data: Buffer, fileName: string): Promise<string> {
    let lastError: Error | null = null;
    for (const gw of this.gateways) {
      try {
        return await this.uploadToGateway(gw, data, fileName);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError ?? new Error("No IPFS gateways configured");
  }

  async download(ipfsHash: string, preferredIp?: string): Promise<Buffer> {
    const ordered = this.orderGateways(preferredIp);
    let lastError: Error | null = null;
    for (const gw of ordered) {
      try {
        return await this.downloadFromGateway(gw, ipfsHash);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError ?? new Error("No IPFS gateways configured");
  }

  private isPrivateIp(ip: string): boolean {
    const parts = ip.split(".");
    if (parts.length !== 4) return true;
    const octets = parts.map(Number);
    if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return true;
    const [a, b] = octets;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }

  private orderGateways(preferredIp?: string): IpfsGateway[] {
    if (!preferredIp) return this.gateways;
    const preferred = this.gateways.filter((g) => g.host === preferredIp);
    const rest = this.gateways.filter((g) => g.host !== preferredIp);
    if (preferred.length === 0) {
      if (this.isPrivateIp(preferredIp)) return this.gateways;
      return [{ host: preferredIp, port: 80, protocol: "http:" }, ...this.gateways];
    }
    return [...preferred, ...rest];
  }

  private uploadToGateway(gw: IpfsGateway, data: Buffer, fileName: string): Promise<string> {
    const form = new FormData();
    form.append("file", data, { filename: fileName });
    const headers: Record<string, string> = { ...form.getHeaders() };
    if (gw.authHeader) headers["Authorization"] = gw.authHeader;

    return new Promise<string>((resolve, reject) => {
      const client = gw.protocol === "https:" ? https : http;
      const req = client.request(
        { hostname: gw.host, port: gw.port, path: "/api/v0/add", method: "POST", headers },
        (res) => {
          let body = "";
          res.on("data", (chunk: Buffer) => (body += chunk.toString()));
          res.on("end", () => {
            const headerHash = res.headers["ipfs-hash"];
            if (headerHash) {
              resolve(Array.isArray(headerHash) ? headerHash[0] : headerHash);
              return;
            }
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const json = JSON.parse(body);
                if (json.Hash) resolve(json.Hash as string);
                else reject(new Error(`No Hash in IPFS response: ${body}`));
              } catch {
                reject(new Error(`Failed to parse IPFS response: ${body}`));
              }
            } else {
              reject(new Error(`IPFS upload failed (${res.statusCode}): ${body}`));
            }
          });
        },
      );
      req.on("error", reject);
      req.setTimeout(30000, () => req.destroy(new Error("IPFS upload timeout")));
      form.pipe(req);
    });
  }

  private downloadFromGateway(gw: IpfsGateway, ipfsHash: string): Promise<Buffer> {
    const headers: Record<string, string> = {};
    if (gw.authHeader) headers["Authorization"] = gw.authHeader;

    return new Promise<Buffer>((resolve, reject) => {
      const client = gw.protocol === "https:" ? https : http;
      const req = client.request(
        {
          hostname: gw.host,
          port: gw.port,
          path: `/api/v0/cat?arg=${encodeURIComponent(ipfsHash)}`,
          method: "POST",
          headers,
        },
        (res) => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            res.resume();
            reject(new Error(`IPFS download failed (${res.statusCode}) for ${ipfsHash}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        },
      );
      req.on("error", reject);
      req.setTimeout(60000, () => req.destroy(new Error("IPFS download timeout")));
      req.end();
    });
  }
}
