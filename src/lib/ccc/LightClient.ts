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
import { LightClient } from "ckb-light-client-js";
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
    // todo: light-client has no such method so we just hardcode a value
    return { mean: BigInt(1000), median: BigInt(1000) };
  }
  async getTip(): Promise<Num> {
    const tipHeader = await this.lightClient.getTipHeader();
    return tipHeader.number;
  }
  async getTipHeader(_verbosity?: number | null): Promise<ClientBlockHeader> {
    return await this.lightClient.getTipHeader();
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
    return await this.lightClient.getHeader(blockHash);
  }
  async getCellsCapacity(key: ClientIndexerSearchKeyLike): Promise<Num> {
    return await this.lightClient.getCellsCapacity(key);
  }
  async estimateCycles(transaction: TransactionLike): Promise<Num> {
    //todo: update light-client-js's ccc deps version to make this compatible
    return this.lightClient.estimateCycles(transaction as any);
  }
  async sendTransactionDry(transaction: TransactionLike, validator?: OutputsValidator): Promise<Num> {
    throw new Error("Not implemented");
  }
  async sendTransactionNoCache(transaction: TransactionLike): Promise<Hex> {
    return this.lightClient.sendTransaction(transaction as any);
  }
  async getTransactionNoCache(txHash: HexLike): Promise<ClientTransactionResponse | undefined> {
    //todo: update light-client-js's ccc deps version to make this compatible
    return this.lightClient.getTransaction(txHash) as any;
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
    //todo: update light-client-js's ccc deps version to make this compatible
    return (await this.lightClient.getCells(key, order, limit, after as Hex)) as any;
  }
  async findTransactionsPaged(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsResponse | ClientFindTransactionsGroupedResponse | any> {
    //todo: update light-client-js's ccc deps version to make this compatible
    return (await this.lightClient.getTransactions(key, order, limit, after as Hex)) as any;
  }

  async start() {
    return await this.lightClient.start(
      { type: this.networkType, config: this.lightClientConfig },
      this.syncingKey,
      "info",
    );
  }
}
