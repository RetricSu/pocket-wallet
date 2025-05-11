import { ccc } from "@ckb-ccc/core";
import React, { useState } from "react";
import { useLightClient } from "../../contexts";
import { useNostrSigner } from "../../contexts";
import { truncateAddress } from "../../utils/stringUtils";

export const SendTab: React.FC = () => {
  const { signer, isConnected } = useNostrSigner();
  const { client } = useLightClient();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    if (!signer || !isConnected) {
      console.error("No signer or not connected");
      return;
    }

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
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-medium text-text-primary mb-6">Send CKB</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-text-primary mb-2">Recipient Address</label>
          <input
            type="text"
            className="w-full bg-white/5 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 border border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-primary mb-2">Amount</label>
          <input
            type="number"
            className="w-full bg-white/5 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 border border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-primary py-3 rounded-lg hover:bg-primary-hover text-white font-medium transition-colors"
          onClick={handleSend}
        >
          Send
        </button>
        {sendStatus === "success" && (
          <div className="text-green-400 text-center my-2">
            Successfully sent, view
            <a
              className="text-primary mx-2 hover:text-primary-hover"
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
