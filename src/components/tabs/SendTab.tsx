import { ccc } from "@ckb-ccc/core";
import React, { useEffect, useState } from "react";
import { useLightClient } from "../../contexts";
import { useNostrSigner } from "../../contexts";
import { nostrService, ProfileInfo } from "../../services/nostr";
import { ProfileImg } from "../common/ProfileImg";
import { Notification } from "../common/Notification";

export const SendTab: React.FC = () => {
  const { signer, isConnected, nostrPublicKey } = useNostrSigner();
  const { client } = useLightClient();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [followers, setFollowers] = useState<(ProfileInfo & { ckbAddress: string })[]>([]);
  const [selectedContactAddress, setSelectedContactAddress] = useState<string | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const handleSend = async () => {
    if (!signer || !isConnected) {
      console.error("No signer or not connected");
      return;
    }

    setIsLoading(true);
    try {
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
      }, 5000);
      console.log("Transaction sent:", hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowers = async () => {
    if (!nostrPublicKey) {
      console.error("No nostrPublicKey or not connected");
      return;
    }
    setIsLoadingContacts(true);
    try {
      const followers = await nostrService.getFollowerProfiles(nostrPublicKey.slice(2));
      const ckbAddresses = await Promise.all(followers.map((follower) => getCkbAddress(follower.nostrPublicKey)));
      setFollowers(followers.map((follower, index) => ({ ...follower, ckbAddress: ckbAddresses[index] })));
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
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
    <div className="max-w-xl mx-auto relative">
      {sendStatus === "success" && (
        <Notification
          type="success"
          message="Transaction successful!"
          actionLink={{
            text: "View on Explorer",
            url: `https://testnet.explorer.nervos.org/transaction/${txHash}`,
          }}
        />
      )}

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
          className="w-full bg-primary py-3 rounded-lg hover:bg-primary-hover text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="mt-6">
        <div className="border rounded-lg p-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {isLoadingContacts ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
              <p>Loading Nostr contacts...</p>
            </div>
          ) : followers.length > 0 ? (
            followers.map((follower) => {
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
                      <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{follower.npub}</p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-text-secondary">No contacts found</div>
          )}
        </div>
      </div>
    </div>
  );
};
