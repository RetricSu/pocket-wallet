import { ccc } from "@ckb-ccc/core";
import React, { useEffect, useState } from "react";
import { useLightClient } from "../../contexts";
import { useNostrSigner } from "../../contexts";
import { truncateAddress } from "../../utils/stringUtils";
import { nostrService, ProfileInfo } from "../../services/nostr";
import { ProfileImg } from "../ProfileImg";

export const SendTab: React.FC = () => {
  const { signer, isConnected, nostrPublicKey } = useNostrSigner();
  const { client } = useLightClient();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [followers, setFollowers] = useState<(ProfileInfo & { ckbAddress: string })[]>([]);
  const [selectedContactAddress, setSelectedContactAddress] = useState<string | null>(null);

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

  const getFollowers = async () => {
    if (!nostrPublicKey) {
      console.error("No nostrPublicKey or not connected");
      return;
    }
    const followers = await nostrService.getFollowerProfiles(nostrPublicKey.slice(2));
    const ckbAddresses = await Promise.all(followers.map((follower) => getCkbAddress(follower.nostrPublicKey)));
    setFollowers(followers.map((follower, index) => ({ ...follower, ckbAddress: ckbAddresses[index] })));
  };

  const getCkbAddress = async (publicKey: string) => {
    const address = await ccc.Address.fromKnownScript(client, ccc.KnownScript.NostrLock, "0x00" + publicKey);
    return address.toString();
  };

  const handleSelectContact = (address: string) => {
    setRecipientAddress(address);
    setSelectedContactAddress(address);
  };

  useEffect(() => {
    getFollowers();
  }, [nostrPublicKey]);

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-medium text-text-primary mb-6">Send CKB</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-text-primary mb-2">Recipient CKB Address</label>
          <input
            type="text"
            className="w-full bg-white/5 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 border border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            placeholder="Enter recipient CKB address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-primary mb-2">Amount(CKB)</label>
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
      <div className="mt-6">
        <h2 className="text-lg font-medium text-text-primary mb-6">Contacts</h2>
        <div className="border p-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {followers.map((follower) => {
            const isSelected = selectedContactAddress === follower.ckbAddress;
            return (
              <div
                key={follower.name}
                className={`rounded-lg p-4 border-b cursor-pointer transition-colors
                  ${isSelected ? "bg-primary/20 border-primary/30" : "hover:bg-white/10 border-b"}`}
                onClick={() => handleSelectContact(follower.ckbAddress)}
              >
                <div className="flex items-center gap-2">
                  <ProfileImg imageUrl={follower.picture} />
                  <h3 className="text-lg font-medium text-text-primary">{follower.name}</h3>
                  {isSelected && (
                    <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Selected</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{follower.npub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
