import {
  Cell,
  ClientBlock,
  ClientBlockHeader,
  ClientCache,
  ClientFindCellsResponse,
  ClientFindTransactionsGroupedResponse,
  ClientFindTransactionsResponse,
  ClientIndexerSearchKeyLike,
  ClientIndexerSearchKeyTransactionLike,
  ClientTransactionResponse,
  Hex,
  HexLike,
  Num,
  NumLike,
  OutPointLike,
  OutputsValidator,
  TransactionLike,
} from "@ckb-ccc/core";
import { LightClient, LightClientSetScriptsCommand, ScriptStatus } from "ckb-light-client-js";
import { CCCLightClientProvider } from "./LightClientProvider";

export type NetworkType = "TestNet" | "MainNet";

export abstract class CCCLightClient extends CCCLightClientProvider {
  readonly networkType: NetworkType;
  readonly lightClientConfig: any;
  readonly syncingKey: Hex;
  constructor(config: {
    cache?: ClientCache;
    client?: LightClient;
    networkType: NetworkType;
    lightClientConfig: any;
    syncingKey: Hex;
  }) {
    super(config);
    this.networkType = config.networkType;
    this.lightClientConfig = config.lightClientConfig;
    this.syncingKey = config.syncingKey;
  }

  async getFeeRateStatistics(blockRange?: NumLike): Promise<{ mean: Num; median: Num }> {
    throw new Error("Not implemented");
  }
  async getTip(): Promise<Num> {
    const tipHeader = await this.client.getTipHeader();
    return tipHeader.number;
  }
  async getTipHeader(_verbosity?: number | null): Promise<ClientBlockHeader> {
    return this.client.getTipHeader();
  }
  async getBlockByNumberNoCache(
    blockNumber: NumLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined> {
    throw new Error("Not implemented");
  }
  async getBlockByHashNoCache(
    blockHash: HexLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined> {
    throw new Error("Not implemented");
  }
  async getHeaderByNumberNoCache(
    blockNumber: NumLike,
    verbosity?: number | null,
  ): Promise<ClientBlockHeader | undefined> {
    throw new Error("Not implemented");
  }
  async getHeaderByHashNoCache(blockHash: HexLike, verbosity?: number | null): Promise<ClientBlockHeader | undefined> {
    throw new Error("Not implemented");
  }
  async getCellsCapacity(key: ClientIndexerSearchKeyLike): Promise<Num> {
    const cells = await this.client.getCellsCapacity(key);
    console.log(key, cells);
    return cells;
  }
  async estimateCycles(transaction: TransactionLike): Promise<Num> {
    return this.client.estimateCycles(transaction as any);
  }
  async sendTransactionDry(transaction: TransactionLike, validator?: OutputsValidator): Promise<Num> {
    throw new Error("Not implemented");
  }
  async sendTransactionNoCache(transaction: TransactionLike): Promise<Hex> {
    return this.client.sendTransaction(transaction as any);
  }
  async getTransactionNoCache(txHash: HexLike): Promise<ClientTransactionResponse | undefined> {
    return this.client.getTransaction(txHash) as any;
  }
  async getCellLiveNoCache(
    outPointLike: OutPointLike,
    withData?: boolean | null,
    includeTxPool?: boolean | null,
  ): Promise<Cell | undefined> {
    throw new Error("Not implemented");
  }
  async findCellsPagedNoCache(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindCellsResponse> {
    throw new Error("Not implemented");
  }
  async findTransactionsPaged(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsResponse | ClientFindTransactionsGroupedResponse | any> {
    throw new Error("Not implemented");
  }

  async startSync() {
    return await this.client.start({ type: this.networkType, config: this.lightClientConfig }, this.syncingKey, "info");
  }

  async setScripts(scripts: ScriptStatus[], command: LightClientSetScriptsCommand) {
    return await this.client.setScripts(scripts, command);
  }

  async getScripts() {
    return await this.client.getScripts();
  }

  async getPeers() {
    return await this.client.getPeers();
  }

  async localNodeInfo() {
    return await this.client.localNodeInfo();
  }
}
