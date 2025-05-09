import { ccc, CellOutputLike, ClientBlockHeader, Hex, Transaction } from "@ckb-ccc/core";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";
import React, { useEffect, useState } from "react";
import { useLightClient, useNostrSigner } from "../../contexts";
import { formatCKBBalance } from "../../utils/stringUtils";

export interface DisplayTransaction {
  txHash: Hex;
  balanceChange: bigint;
  timestamp: number;
}

export const ActivityTab: React.FC = () => {
  const { signer } = useNostrSigner();
  const { client, isClientStart: isInitialized } = useLightClient();

  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);

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
        for (const input of currTx.inputs) {
          const inputTx = await client.lightClient.fetchTransaction(input.previousOutput.txHash);
          if (inputTx.status !== "fetched") return;
          const previousOutput = inputTx.data.transaction.outputs[Number(input.previousOutput.index)];
          if (validateCell(previousOutput)) inputCapSum += previousOutput.capacity;
        }
        const currTxBlockDetail: ClientBlockHeader = (await client.lightClient.getHeader(
          (await client.getTransaction(currTx.hash()))!.blockHash!,
        ))!;
        if (!resultTx.find((tx) => tx.txHash === currTx.hash())) {
          resultTx.push({
            balanceChange: outCapSum - inputCapSum,
            timestamp: Number(currTxBlockDetail.timestamp),
            txHash: currTx.hash(),
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
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-400">
              <th className="px-6 py-3">Transaction Hash</th>
              <th className="px-6 py-3">Balance Change(CKB)</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx.txHash} className="hover:bg-navy-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                  <a
                    href={`http://testnet.explorer.nervos.org/en/transaction/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`${tx.balanceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCKBBalance(tx.balanceChange)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
