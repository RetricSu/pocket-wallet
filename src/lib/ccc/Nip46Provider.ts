import { ccc } from "@ckb-ccc/core";
import { parseBunkerInput, BunkerSigner } from "nostr-tools/nip46";
export class Nip46Provider {
  private readonly secretKey: Uint8Array;
  private bunker?: BunkerSigner;
  public isConnected = false;

  constructor(secretKey: Uint8Array) {
    this.secretKey = secretKey;
  }

  async connect(bunkerString: string) {
    const bunkerPointer = await parseBunkerInput(bunkerString);
    if (!bunkerPointer) {
      throw new Error("Invalid bunker input");
    }
    this.bunker = new BunkerSigner(this.secretKey, bunkerPointer);
    console.debug("create new bunkerSigner:", bunkerPointer);
    await this.bunker.connect();
    await this.bunker.getPublicKey();
    console.debug("bunker connected");
    this.isConnected = true;
    return this.bunker;
  }

  async reconnect(bunkerString: string) {
    const bunkerPointer = await parseBunkerInput(bunkerString);
    if (!bunkerPointer) {
      throw new Error("Invalid bunker input");
    }
    this.bunker = new BunkerSigner(this.secretKey, bunkerPointer);
    console.debug("rebuild new bunkerSigner:", bunkerPointer);
    await this.bunker.getPublicKey();
    console.debug("bunker connected");
    this.isConnected = true;
    return this.bunker;
  }

  async disconnect() {
    this.isConnected = false;
    await this.bunker?.close();
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
