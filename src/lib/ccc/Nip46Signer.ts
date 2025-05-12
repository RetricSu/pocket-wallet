import { ccc } from "@ckb-ccc/core";
import { Nip46Provider } from "./Nip46Provider";

export class Nip46Signer extends ccc.SignerNostr {
  private publicKeyCache?: Promise<string> = undefined;

  constructor(
    client: ccc.Client,
    public readonly provider: Nip46Provider,
  ) {
    super(client);
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    if (!this.publicKeyCache) {
      this.publicKeyCache = this.provider.getPublicKey().catch((e) => {
        this.publicKeyCache = undefined;
        throw e;
      });
    }

    return ccc.hexFrom(await this.publicKeyCache!);
  }

  async signNostrEvent(event: ccc.NostrEvent): Promise<Required<ccc.NostrEvent>> {
    return this.provider.signEvent({
      ...event,
      pubkey: await this.publicKeyCache,
    });
  }

  async connectToBunker(bunkerString: string): Promise<void> {
    await this.provider.connect(bunkerString);
  }

  async connect() {
    throw new Error("this is not compatible with CCC connector right now, please use connectToBunker instead");
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  async isConnected(): Promise<boolean> {
    return this.provider.isConnected;
  }
}
