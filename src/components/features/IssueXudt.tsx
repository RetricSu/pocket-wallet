import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useLightClient, useNostrSigner } from "../../contexts";
import { ccc } from "@ckb-ccc/core";
import { Notification } from "../common/Notification";

export interface IssueXudtProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssueXudt = ({ isOpen, onClose }: IssueXudtProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Effect to handle notification display and auto-hide
  useEffect(() => {
    if (notification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const { signer, recommendedAddressObj } = useNostrSigner();
  const { client } = useLightClient();

  const handleIssue = async () => {
    if (!signer || !recommendedAddressObj) {
      console.error("No signer or recommended address");
      setNotification({
        type: "error",
        message: "No signer or recommended address available",
      });
      return;
    }

    setIsLoading(true);

    const lock = recommendedAddressObj.script;

    try {
      const tx = ccc.Transaction.from({
        outputs: [
          {
            lock,
            type: await ccc.Script.fromKnownScript(signer.client, ccc.KnownScript.XUdt, lock.hash()),
          },
        ],
        outputsData: [ccc.numLeToBytes(amount, 16)],
      });

      await tx.addCellDepsOfKnownScripts(signer.client, ccc.KnownScript.XUdt);

      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeBy(signer);

      for (const deps of tx.cellDeps) {
        const tx = await client.lightClient.fetchTransaction(deps.outPoint.txHash);
        console.log("celldep Transaction:", tx);
      }

      console.log("Transaction:", tx);

      const txHash = await signer.sendTransaction(tx);
      console.log("Transaction sent:", txHash);

      setNotification({
        type: "success",
        message: `Token issued successfully! Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    } catch (error) {
      console.error("Error issuing token:", error);
      setNotification({
        type: "error",
        message: `Failed to issue token: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-background rounded-lg p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text-primary">Issue Fungible Token</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Floating notification */}
        {showNotification && notification && (
          <div className="absolute left-0 right-0 mx-6" style={{ top: "3.5rem" }}>
            <Notification type={notification.type} message={notification.message} onClose={onClose} />
          </div>
        )}

        <div className="space-y-4">
          <div className="text-sm text-text-secondary">Token Standard: XUDT</div>
          <div className="text-sm text-text-secondary">
            Lock Args: {recommendedAddressObj?.script.hash().slice(0, 16)}..
            {recommendedAddressObj?.script.hash().slice(-16)}
          </div>
          <div>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 rounded-lg border border-border/40 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              placeholder="Enter issue amount"
            />
          </div>

          <div className="pt-4">
            <button
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors w-full"
              onClick={handleIssue}
              disabled={isLoading}
            >
              {isLoading ? "Issuing..." : "Issue Token"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use ReactDOM.createPortal to render the modal directly in the document body
  return ReactDOM.createPortal(modalContent, document.body);
};
