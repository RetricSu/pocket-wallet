import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/core";
import { useLightClient, useNostrSigner } from "../../contexts";

interface AssetsTabProps {}

export const AssetsTab: React.FC<AssetsTabProps> = () => {
  const { client } = useLightClient();
  const { signer } = useNostrSigner();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<bigint | null>(null);

  // Helper function to format large numbers
  const formatBalance = (balance: bigint | null): string => {
    if (balance === null) return "0";
    const balanceStr = ccc.fixedPointToString(balance, 8);
    return new Intl.NumberFormat().format(Number(balanceStr));
  };

  const refreshBalance = async () => {
    try {
      setIsLoading(true);
      const addr = await signer.getRecommendedAddressObj();
      const balance = await client.getBalanceSingle(addr.script);
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
  }, [client, signer]);

  return (
    <div className="space-y-8">
      {/* Total Balance Card */}
      <div className="bg-secondary rounded-card p-8 shadow-card border border-border overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-text-secondary font-medium mb-3">Total Balance</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-text-primary">{formatBalance(balance)}</span>
            <span className="text-lg text-text-secondary font-medium">CKB</span>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-5 py-2.5 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors font-medium flex items-center gap-2">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Receive
            </button>
            <button className="px-5 py-2.5 bg-secondary-hover text-text-primary rounded-button hover:bg-border/50 transition-colors font-medium border border-border flex items-center gap-2">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="bg-secondary rounded-card p-8 shadow-card border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Tokens</h2>
          <button className="text-primary hover:text-primary-hover transition-colors text-sm font-medium flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Issue Token
          </button>
        </div>
        <div className="space-y-4">
          {/* CKB Token */}
          <div className="flex items-center justify-between p-5 bg-secondary-hover rounded-xl hover:shadow-sm transition-all duration-200 border border-border/50 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold">CKB</span>
              </div>
              <div>
                <p className="font-semibold text-text-primary">CKB</p>
                <p className="text-sm text-text-secondary">Nervos CKB</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text-primary text-lg">{formatBalance(balance)}</p>
              <p className="text-sm text-text-secondary">≈ $0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
