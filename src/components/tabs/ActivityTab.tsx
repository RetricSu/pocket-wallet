import { CellOutputLike, ClientBlockHeader, Hex, Transaction } from "@ckb-ccc/core";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";
import React, { useEffect, useState } from "react";
import { useLightClient, useNostrSigner } from "../../contexts";
import { formatCKBBalance } from "../../utils/stringUtils";
import { NostrVerifyModal } from "../NostrVerifyModal";

export interface DisplayTransaction {
  txHash: Hex;
  balanceChange: bigint;
  timestamp: number;
  isNostrUnlock: boolean;
  transaction: Transaction;
}

export const ActivityTab: React.FC = () => {
  const { signer } = useNostrSigner();
  const { client, isClientStart: isInitialized } = useLightClient();

  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const updateTransactions = async () => {
    const resultTx: DisplayTransaction[] = [];

    const address = await signer.getRecommendedAddressObj();
    const script = address.script;
    const searchKey = {
      scriptType: "lock",
      script,
      scriptSearchMode: "prefix",
    } as ClientCollectableSearchKeyLike;

    const txs = await client.lightClient.getTransactions(searchKey, "desc", 100);
    const validateCell = (v: CellOutputLike) =>
      v.lock?.args === script.args && v.lock?.codeHash === script.codeHash && v.lock?.hashType === script.hashType;

    for (const tx of txs.transactions) {
      const currTx = tx.transaction as unknown as Transaction;
      const outCapSum = currTx.outputs
        .filter(validateCell)
        .map((s) => s.capacity)
        .reduce((a, b) => a + b, BigInt(0));
      let inputCapSum = BigInt(0);
      await (async () => {
        let isNostrUnlock = false;
        for (const input of currTx.inputs) {
          const inputTx = await client.lightClient.fetchTransaction(input.previousOutput.txHash);
          if (inputTx.status !== "fetched") return;
          const previousOutput = inputTx.data.transaction.outputs[Number(input.previousOutput.index)];
          if (validateCell(previousOutput)) inputCapSum += previousOutput.capacity;
          if (
            previousOutput.lock?.args === script.args &&
            previousOutput.lock?.codeHash === script.codeHash &&
            previousOutput.lock?.hashType === script.hashType
          ) {
            isNostrUnlock = true;
          }
        }
        const currTxBlockDetail: ClientBlockHeader = (await client.lightClient.getHeader(
          (await client.getTransaction(currTx.hash()))!.blockHash!,
        ))!;
        if (!resultTx.find((tx) => tx.txHash === currTx.hash())) {
          resultTx.push({
            balanceChange: outCapSum - inputCapSum,
            timestamp: Number(currTxBlockDetail.timestamp),
            txHash: currTx.hash(),
            transaction: currTx,
            isNostrUnlock,
          });
        }
      })();
    }
    return resultTx;
  };

  useEffect(() => {
    const update = async () => {
      const txs = await updateTransactions();
      setTransactions(txs);
    };
    update();
  }, [signer, client, isInitialized]);

  return (
    <>
      <h2 className="text-lg font-medium text-text-primary mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/20">
          <thead>
            <tr className="text-left text-sm font-medium text-text-primary">
              <th className="px-6 py-3">Transaction Hash</th>
              <th className="px-6 py-3">Balance Change(CKB)</th>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Nostr Lock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {transactions.map((tx) => (
              <tr key={tx.txHash} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary font-mono">
                  <a
                    href={`http://testnet.explorer.nervos.org/en/transaction/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover"
                  >
                    {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`${tx.balanceChange >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatCKBBalance(tx.balanceChange)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">{new Date(tx.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  {tx.isNostrUnlock && (
                    <button
                      className="bg-primary hover:bg-primary-hover text-white font-medium py-1 px-3 rounded"
                      onClick={() => {
                        setSelectedTx(tx.transaction);
                        setIsModalOpen(true);
                      }}
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTx && (
        <NostrVerifyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTx(null);
          }}
          transaction={selectedTx}
        />
      )}
    </>
  );
};
