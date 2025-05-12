import { ccc } from "@ckb-ccc/core";
import { SimplePool } from "nostr-tools";
import { parseBunkerInput, BunkerSigner } from "nostr-tools/nip46";
export class Nip46Provider {
  private pool: SimplePool;
  private readonly secretKey: Uint8Array;
  private bunker?: BunkerSigner;
  public isConnected = false;

  constructor(secretKey: Uint8Array) {
    this.secretKey = secretKey;
    this.pool = new SimplePool();
  }

  async connect(bunkerString: string) {
    const bunkerPointer = await parseBunkerInput(bunkerString);
    if (!bunkerPointer) {
      throw new Error("Invalid bunker input");
    }
    this.bunker = new BunkerSigner(this.secretKey, bunkerPointer, { pool: this.pool });
    await this.bunker.connect();
    this.isConnected = true;
    return this.bunker;
  }

  async disconnect() {
    this.isConnected = false;
    await this.bunker?.close();
    await this.pool.close([]);
    this.bunker = undefined;
  }

  async getPublicKey(): Promise<string> {
    if (!this.bunker) {
      throw new Error("Not connected");
    }
    return await this.bunker.getPublicKey();
  }

  async signEvent(event: ccc.NostrEvent): Promise<Required<ccc.NostrEvent>> {
    if (!this.bunker) {
      throw new Error("Not connected");
    }
    return await this.bunker.signEvent(event);
  }
}
