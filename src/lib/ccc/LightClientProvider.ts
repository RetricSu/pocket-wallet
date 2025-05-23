import {
  Cell,
  CellDep,
  CellDepInfo,
  CellDepInfoLike,
  ClientBlock,
  ClientBlockHeader,
  ClientCache,
  ClientCacheMemory,
  ClientFindCellsResponse,
  ClientFindTransactionsGroupedResponse,
  ClientFindTransactionsResponse,
  ClientIndexerSearchKey,
  ClientIndexerSearchKeyLike,
  ClientIndexerSearchKeyTransactionLike,
  ClientTransactionResponse,
  ErrorClientMaxFeeRateExceeded,
  ErrorClientWaitTransactionTimeout,
  Hex,
  hexFrom,
  HexLike,
  KnownScript,
  Num,
  numFrom,
  NumLike,
  numMax,
  numMin,
  OutPoint,
  OutPointLike,
  OutputsValidator,
  reduceAsync,
  ScriptInfo,
  ScriptLike,
  sleep,
  Transaction,
  TransactionLike,
  Zero,
} from "@ckb-ccc/core";
import {
  DEFAULT_MIN_FEE_RATE,
  DEFAULT_MAX_FEE_RATE,
  ClientCollectableSearchKeyLike,
  CONFIRMED_BLOCK_TIME,
} from "@ckb-ccc/core/advancedBarrel";
import { LightClient } from "ckb-light-client-js";

function hasHeaderConfirmed(header: ClientBlockHeader): boolean {
  return numFrom(Date.now()) - header.timestamp >= CONFIRMED_BLOCK_TIME;
}

export abstract class CCCLightClientProvider {
  public lightClient: LightClient;
  public cache: ClientCache;

  constructor(config?: { cache?: ClientCache; client?: LightClient }) {
    this.lightClient = config?.client ?? new LightClient();
    this.cache = config?.cache ?? new ClientCacheMemory();
  }

  abstract get addressPrefix(): string;
  abstract getKnownScript(script: KnownScript): Promise<ScriptInfo>;

  abstract getFeeRateStatistics(blockRange?: NumLike): Promise<{ mean: Num; median: Num }>;
  abstract getTip(): Promise<Num>;
  abstract getTipHeader(verbosity?: number | null): Promise<ClientBlockHeader>;
  abstract getBlockByNumberNoCache(
    blockNumber: NumLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined>;
  abstract getBlockByHashNoCache(
    blockHash: HexLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined>;
  abstract getHeaderByNumberNoCache(
    blockNumber: NumLike,
    verbosity?: number | null,
  ): Promise<ClientBlockHeader | undefined>;
  abstract getHeaderByHashNoCache(
    blockHash: HexLike,
    verbosity?: number | null,
  ): Promise<ClientBlockHeader | undefined>;
  abstract getCellsCapacity(key: ClientIndexerSearchKeyLike): Promise<Num>;
  abstract estimateCycles(transaction: TransactionLike): Promise<Num>;
  abstract sendTransactionDry(transaction: TransactionLike, validator?: OutputsValidator): Promise<Num>;
  abstract sendTransactionNoCache(transaction: TransactionLike, validator?: OutputsValidator): Promise<Hex>;
  abstract getTransactionNoCache(txHash: HexLike): Promise<ClientTransactionResponse | undefined>;
  abstract getCellLiveNoCache(
    outPointLike: OutPointLike,
    withData?: boolean | null,
    includeTxPool?: boolean | null,
  ): Promise<Cell | undefined>;
  abstract findCellsPagedNoCache(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindCellsResponse>;
  abstract findTransactionsPaged(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction: true;
    },
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsGroupedResponse>;
  abstract findTransactionsPaged(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction?: false | null;
    },
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsResponse>;
  abstract findTransactionsPaged(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindTransactionsResponse | ClientFindTransactionsGroupedResponse>;

  async getBlockByNumber(
    blockNumber: NumLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined> {
    const block = await this.cache.getBlockByNumber(blockNumber);
    if (block) {
      return block;
    }

    const res = await this.getBlockByNumberNoCache(blockNumber, verbosity, withCycles);
    if (res && hasHeaderConfirmed(res.header)) {
      await this.cache.recordBlocks(res);
    }
    return res;
  }
  async getBlockByHash(
    blockHash: HexLike,
    verbosity?: number | null,
    withCycles?: boolean | null,
  ): Promise<ClientBlock | undefined> {
    const block = await this.cache.getBlockByHash(blockHash);
    if (block) {
      return block;
    }

    const res = await this.getBlockByHashNoCache(blockHash, verbosity, withCycles);
    if (res && hasHeaderConfirmed(res.header)) {
      await this.cache.recordBlocks(res);
    }
    return res;
  }
  async getHeaderByNumber(blockNumber: NumLike, verbosity?: number | null): Promise<ClientBlockHeader | undefined> {
    const header = await this.cache.getHeaderByNumber(blockNumber);
    if (header) {
      return header;
    }

    const res = await this.getHeaderByNumberNoCache(blockNumber, verbosity);
    if (res && hasHeaderConfirmed(res)) {
      await this.cache.recordHeaders(res);
    }
    return res;
  }
  async getHeaderByHash(blockHash: HexLike, verbosity?: number | null): Promise<ClientBlockHeader | undefined> {
    const header = await this.cache.getHeaderByHash(blockHash);
    if (header) {
      return header;
    }

    const res = await this.getHeaderByHashNoCache(blockHash, verbosity);
    if (res && hasHeaderConfirmed(res)) {
      await this.cache.recordHeaders(res);
    }
    return res;
  }
  async getCell(outPointLike: OutPointLike): Promise<Cell | undefined> {
    const outPoint = OutPoint.from(outPointLike);
    const cached = await this.cache.getCell(outPoint);

    if (cached) {
      return cached;
    }

    const transaction = await this.getTransaction(outPoint.txHash);
    if (!transaction) {
      return;
    }
    const output = transaction.transaction.getOutput(outPoint.index);
    if (!output) {
      return;
    }

    const cell = Cell.from({
      outPoint,
      ...output,
    });
    await this.cache.recordCells(cell);
    return cell;
  }
  async getCellLive(
    outPointLike: OutPointLike,
    withData?: boolean | null,
    includeTxPool?: boolean | null,
  ): Promise<Cell | undefined> {
    const cell = await this.getCellLiveNoCache(outPointLike, withData, includeTxPool);
    if (withData && cell) {
      await this.cache.recordCells(cell);
    }
    return cell;
  }
  async getCellWithHeader(outPointLike: OutPointLike): Promise<{ cell: Cell; header?: ClientBlockHeader } | undefined> {
    const outPoint = OutPoint.from(outPointLike);

    const res = await this.getTransactionWithHeader(outPoint.txHash);
    if (!res) {
      return;
    }
    const { transaction, header } = res;

    const output = transaction.transaction.getOutput(outPoint.index);
    if (!output) {
      return;
    }

    const cell = Cell.from({
      outPoint,
      ...output,
    });
    await this.cache.recordCells(cell);
    return { cell, header };
  }
  async findCellsPaged(
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ): Promise<ClientFindCellsResponse> {
    const res = await this.findCellsPagedNoCache(key, order, limit, after);
    await this.cache.recordCells(res.cells);
    return res;
  }
  async *findCellsOnChain(key: ClientIndexerSearchKeyLike, order?: "asc" | "desc", limit = 10): AsyncGenerator<Cell> {
    let last: string | undefined = undefined;

    while (true) {
      const { cells, lastCursor } = await this.findCellsPaged(key, order, limit, last);
      for (const cell of cells) {
        yield cell;
      }
      if (cells.length === 0 || cells.length < limit) {
        return;
      }
      last = lastCursor;
    }
  }

  /**
   * Find cells by search key designed for collectable cells.
   * The result also includes cached cells, the order param only works for cells fetched from RPC.
   *
   * @param keyLike - The search key.
   * @returns A async generator for yielding cells.
   */
  async *findCells(keyLike: ClientCollectableSearchKeyLike, order?: "asc" | "desc", limit = 10): AsyncGenerator<Cell> {
    const key = ClientIndexerSearchKey.from(keyLike);
    const foundedOutPoints = [];

    for await (const cell of this.cache.findCells(key)) {
      foundedOutPoints.push(cell.outPoint);
      yield cell;
    }

    for await (const cell of this.findCellsOnChain(key, order, limit)) {
      if (
        (await this.cache.isUnusable(cell.outPoint)) ||
        foundedOutPoints.some((founded) => founded.eq(cell.outPoint))
      ) {
        continue;
      }

      yield cell;
    }
  }

  findCellsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    withData = true,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<Cell> {
    return this.findCells(
      {
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "exact",
        filter: {
          script: type,
        },
        withData,
      },
      order,
      limit,
    );
  }

  findCellsByType(type: ScriptLike, withData = true, order?: "asc" | "desc", limit = 10): AsyncGenerator<Cell> {
    return this.findCells(
      {
        script: type,
        scriptType: "type",
        scriptSearchMode: "exact",
        withData,
      },
      order,
      limit,
    );
  }

  async findSingletonCellByType(type: ScriptLike, withData = false): Promise<Cell | undefined> {
    for await (const cell of this.findCellsByType(type, withData, undefined, 1)) {
      return cell;
    }
  }

  async getCellDeps(...cellDepsInfoLike: (CellDepInfoLike | CellDepInfoLike[])[]): Promise<CellDep[]> {
    return Promise.all(
      cellDepsInfoLike.flat().map(async (infoLike) => {
        const { cellDep, type } = CellDepInfo.from(infoLike);
        if (type === undefined) {
          return cellDep;
        }
        const found = await this.findSingletonCellByType(type);
        if (!found) {
          return cellDep;
        }

        return CellDep.from({
          outPoint: found.outPoint,
          depType: cellDep.depType,
        });
      }),
    );
  }

  findTransactions(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction: true;
    },
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactions(
    key: Omit<ClientIndexerSearchKeyTransactionLike, "groupByTransaction"> & {
      groupByTransaction?: false | null;
    },
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactions(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  async *findTransactions(
    key: ClientIndexerSearchKeyTransactionLike,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    let last: string | undefined = undefined;

    while (true) {
      const { transactions, lastCursor }: ClientFindTransactionsResponse | ClientFindTransactionsGroupedResponse =
        await this.findTransactionsPaged(key, order, limit, last);
      for (const tx of transactions) {
        yield tx;
      }
      if (transactions.length === 0 || transactions.length < limit) {
        return;
      }
      last = lastCursor;
    }
  }

  findTransactionsByLock(
    lock: ScriptLike,
    type: ScriptLike | undefined | null,
    groupByTransaction: true,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: false | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  findTransactionsByLock(
    lock: ScriptLike,
    type?: ScriptLike | null,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    return this.findTransactions(
      {
        script: lock,
        scriptType: "lock",
        scriptSearchMode: "exact",
        filter: {
          script: type,
        },
        groupByTransaction,
      },
      order,
      limit,
    );
  }

  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction: true,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsGroupedResponse["transactions"][0]>;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: false | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<ClientFindTransactionsResponse["transactions"][0]>;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit?: number,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  >;
  findTransactionsByType(
    type: ScriptLike,
    groupByTransaction?: boolean | null,
    order?: "asc" | "desc",
    limit = 10,
  ): AsyncGenerator<
    ClientFindTransactionsResponse["transactions"][0] | ClientFindTransactionsGroupedResponse["transactions"][0]
  > {
    return this.findTransactions(
      {
        script: type,
        scriptType: "type",
        scriptSearchMode: "exact",
        groupByTransaction,
      },
      order,
      limit,
    );
  }

  async getBalanceSingle(lock: ScriptLike): Promise<Num> {
    return this.getCellsCapacity({
      script: lock,
      scriptType: "lock",
      scriptSearchMode: "exact",
      filter: {
        scriptLenRange: [0, 1],
        outputDataLenRange: [0, 1],
      },
    });
  }

  async getBalance(locks: ScriptLike[]): Promise<Num> {
    return reduceAsync(locks, async (acc, lock) => acc + (await this.getBalanceSingle(lock)), Zero);
  }

  async sendTransaction(
    transaction: TransactionLike,
    validator?: OutputsValidator,
    options?: { maxFeeRate?: NumLike },
  ): Promise<Hex> {
    const tx = Transaction.from(transaction);

    const maxFeeRate = numFrom(options?.maxFeeRate ?? DEFAULT_MAX_FEE_RATE);
    const feeRate = numFrom(1000); // todo fix this with light client
    if (maxFeeRate > Zero && feeRate > maxFeeRate) {
      throw new ErrorClientMaxFeeRateExceeded(maxFeeRate, feeRate);
    }

    const txHash = await this.sendTransactionNoCache(tx, validator);

    await this.cache.markTransactions(tx);
    return txHash;
  }

  async getTransaction(txHashLike: HexLike): Promise<ClientTransactionResponse | undefined> {
    const txHash = hexFrom(txHashLike);
    const res = await this.getTransactionNoCache(txHash);
    if (res) {
      await this.cache.recordTransactionResponses(res);
      return res;
    }

    return this.cache.getTransactionResponse(txHash);
  }

  /**
   * This method gets specified transaction with its block header (if existed).
   * This is mainly for caching because we need the header to test if we can safely trust the cached tx status.
   * @param txHashLike
   */
  async getTransactionWithHeader(
    txHashLike: HexLike,
  ): Promise<{ transaction: ClientTransactionResponse; header?: ClientBlockHeader } | undefined> {
    const txHash = hexFrom(txHashLike);
    const tx = await this.cache.getTransactionResponse(txHash);
    if (tx?.blockHash) {
      const header = await this.getHeaderByHash(tx.blockHash);
      if (header && hasHeaderConfirmed(header)) {
        return {
          transaction: tx,
          header,
        };
      }
    }

    const res = await this.getTransactionNoCache(txHash);
    if (!res) {
      return;
    }

    await this.cache.recordTransactionResponses(res);
    return {
      transaction: res,
      header: res.blockHash ? await this.getHeaderByHash(res.blockHash) : undefined,
    };
  }

  async getFeeRate(blockRange?: NumLike, options?: { maxFeeRate?: NumLike }): Promise<Num> {
    const feeRate = numMax((await this.getFeeRateStatistics(blockRange)).median, DEFAULT_MIN_FEE_RATE);

    const maxFeeRate = numFrom(options?.maxFeeRate ?? DEFAULT_MAX_FEE_RATE);
    if (maxFeeRate === Zero) {
      return feeRate;
    }

    return numMin(feeRate, maxFeeRate);
  }

  async waitTransaction(
    txHash: HexLike,
    confirmations: number = 0,
    timeout: number = 60000,
    interval: number = 2000,
  ): Promise<ClientTransactionResponse | undefined> {
    const startTime = Date.now();
    let tx: ClientTransactionResponse | undefined;

    const getTx = async () => {
      const res = await this.getTransaction(txHash);
      if (!res || res.blockNumber == null || ["sent", "pending", "proposed"].includes(res.status)) {
        return undefined;
      }

      tx = res;
      return res;
    };

    while (true) {
      if (!tx) {
        if (await getTx()) {
          continue;
        }
      } else if (confirmations === 0) {
        return tx;
      } else if ((await this.getTipHeader()).number - tx.blockNumber! >= confirmations) {
        return tx;
      }

      if (Date.now() - startTime + interval >= timeout) {
        throw new ErrorClientWaitTransactionTimeout(timeout);
      }
      await sleep(interval);
    }
  }
}
