import { ccc } from "@ckb-ccc/core";
import React, { useState } from "react";
import { useLightClient } from "../../contexts";
import { useNostrSigner } from "../../contexts";
import { truncateAddress } from "../../utils/stringUtils";

export const SendTab: React.FC = () => {
  const { signer } = useNostrSigner();
  const { client } = useLightClient();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    console.log("Sending CKB to:", recipientAddress, "Amount:", amount);
    const address = await ccc.Address.fromString(recipientAddress, signer.client);
    const toLock = address.script;
    const tx = ccc.Transaction.from({
      outputs: [{ lock: toLock, capacity: ccc.fixedPointFrom(amount) }],
    });
    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer); // Transaction fee rate is calculated automatically
    console.log("Sending transaction:", tx);

    for (const deps of tx.cellDeps) {
      const tx = await client.lightClient.fetchTransaction(deps.outPoint.txHash);
      console.log("celldep Transaction:", tx);
    }

    const hash = await signer.sendTransaction(tx);
    setTxHash(hash);
    setSendStatus("success");
    setTimeout(() => {
      setSendStatus("idle");
      setTxHash(null);
    }, 6000);
    console.log("Transaction sent:", hash);
  };

  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-6">Send CKB</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
          <input
            type="text"
            className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-500 font-medium transition-colors"
          onClick={handleSend}
        >
          Send
        </button>
        {sendStatus === "success" && (
          <div className="text-green-400 text-center my-2">
            Successfully sent, view
            <a
              className="text-blue-400 mx-2"
              href={`https://explorer.nervos.org/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {truncateAddress(txHash || "", 8, 8)}
            </a>
            on CKB Explorer
          </div>
        )}
      </div>
    </div>
  );
};
