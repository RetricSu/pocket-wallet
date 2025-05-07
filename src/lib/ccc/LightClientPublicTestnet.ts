import { LightClient } from "ckb-light-client-js";
import { ClientCache, Hex, KnownScript, ScriptInfo, ScriptInfoLike } from "@ckb-ccc/core";
import { CCCLightClient, NetworkType } from "./LightClient";
import { TESTNET_SCRIPTS } from "@ckb-ccc/core/advancedBarrel";

export class LightClientPublicTestnet extends CCCLightClient {
  constructor(
    private readonly config: {
      cache?: ClientCache;
      client?: LightClient;
      scripts?: Record<KnownScript, ScriptInfoLike | undefined>;
      lightClientConfig: any;
      syncingKey: Hex;
    },
  ) {
    super({ ...config, networkType: "TestNet" });
  }

  get url(): string {
    throw new Error("LightClientPublicTestnet does not have a url");
  }

  get addressPrefix(): string {
    return "ckt";
  }

  get scripts(): Record<KnownScript, ScriptInfoLike | undefined> {
    return this.config.scripts ?? TESTNET_SCRIPTS;
  }

  async getKnownScript(script: KnownScript): Promise<ScriptInfo> {
    const found = this.scripts[script];
    if (!found) {
      throw new Error(`No script information was found for ${script} on ${this.addressPrefix}`);
    }
    return ScriptInfo.from(found);
  }
}
