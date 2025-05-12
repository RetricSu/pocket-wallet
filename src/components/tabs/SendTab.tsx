import { ccc } from "@ckb-ccc/core";
import React, { useEffect, useState } from "react";
import { useLightClient } from "../../contexts";
import { useNostrSigner } from "../../contexts";
import { truncateAddress } from "../../utils/stringUtils";
import { nostrService, ProfileInfo } from "../../services/nostr";
import { ProfileImg } from "../common/ProfileImg";

// Define keyframes for the animation
const fadeInDownAnimation = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

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
      <style dangerouslySetInnerHTML={{ __html: fadeInDownAnimation }} />
      {sendStatus === "success" && (
        <div
          className="absolute top-0 left-0 right-0 bg-green-500/90 text-white py-3 px-4 rounded-lg shadow-lg flex items-center justify-between mb-4 z-10"
          style={{ animation: "fadeInDown 0.5s ease-in-out" }}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Transaction successful!</span>
          </div>
          <a
            className="underline hover:text-white/80 ml-2 text-sm flex items-center"
            href={`https://explorer.nervos.org/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
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
