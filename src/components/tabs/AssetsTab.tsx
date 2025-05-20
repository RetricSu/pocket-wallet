import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/core";
import { useLightClient, useNostrSigner, useNavigation } from "../../contexts";
import { IssueXudt } from "../features/IssueXudt";
import { PlusIcon } from "../icons/plus";
import { AssetListItem } from "../common/AssetListItem";

interface AssetsTabProps {}

export const AssetsTab: React.FC<AssetsTabProps> = () => {
  const { client, isClientStarted: isClientStart } = useLightClient();
  const { recommendedAddressObj } = useNostrSigner();
  const { setActiveTabId } = useNavigation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isIssueXudtModalOpen, setIsIssueXudtModalOpen] = useState<boolean>(false);

  // Helper function to format large numbers
  const formatBalance = (balance: bigint | null): string => {
    if (balance === null) return "0";
    const balanceStr = ccc.fixedPointToString(balance, 8);
    return new Intl.NumberFormat().format(Number(balanceStr));
  };

  const refreshBalance = async () => {
    if (isLoading) return;
    if (!recommendedAddressObj) return setBalance(null);

    try {
      setIsLoading(true);
      const balance = await client.getBalanceSingle(recommendedAddressObj.script);
      setBalance(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, [isClientStart, recommendedAddressObj, isLoading]);

  return (
    <>
      {/* Total Balance Section */}
      <div className="mb-10 mt-6 bg-white/5 rounded-xl p-8 border border-border/10 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-sm uppercase tracking-wider text-text-secondary/70 font-medium mb-2">Total Balance</h2>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-5xl font-bold text-text-primary">{formatBalance(balance)}</span>
            <span className="text-lg text-text-secondary font-medium">CKB</span>
          </div>
          <p className="text-text-secondary text-sm mb-6">≈ $0.00 USD</p>

          <div className="flex gap-3">
            <button
              className="px-5 py-3 bg-transparent text-text-primary rounded-lg hover:bg-primary hover:text-secondary transition-colors font-medium border border-border/40 flex items-center gap-2"
              onClick={() => setActiveTabId("receive")}
            >
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Receive
            </button>
            <button
              className="px-5 py-3 bg-transparent text-text-primary rounded-lg hover:bg-primary hover:text-secondary transition-colors font-medium border border-border/40 flex items-center gap-2"
              onClick={() => setActiveTabId("send")}
            >
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Your Assets</h2>
          <div className="flex">
            <div className="flex gap-2">
              <button
                className="text-primary hover:text-secondary transition-colors text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 hover:bg-primary hover:border-primary"
                onClick={() => setIsIssueXudtModalOpen(true)}
              >
                <PlusIcon />
                Issue CKB Token
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* CKB Token */}
          <AssetListItem assetItem={{ name: "CKB", description: "Nervos CKB", balance: formatBalance(balance) }} />
        </div>
      </div>

      {/* IssueXudt Modal */}
      <IssueXudt isOpen={isIssueXudtModalOpen} onClose={() => setIsIssueXudtModalOpen(false)} />
    </>
  );
};
