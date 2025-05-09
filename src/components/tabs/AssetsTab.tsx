import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/core";
import { useLightClient, useNostrSigner } from "../../contexts";

interface AssetsTabProps {}

export const AssetsTab: React.FC<AssetsTabProps> = () => {
  const { client, isInitialized, initializeClient } = useLightClient();
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
      if (!isInitialized) {
        await initializeClient();
      }
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
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-navy-800/80 rounded-2xl p-8 flex items-center justify-between shadow-lg backdrop-blur-sm">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-300">{formatBalance(balance)}</span>
            <span className="text-gray-400">CKB</span>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-400">Tokens</h2>
          <button className="text-blue-400 hover:text-blue-300 text-sm">Add Token</button>
        </div>
        <div className="space-y-4">
          {/* CKB Token */}
          <div className="flex items-center justify-between p-4 bg-navy-700/30 rounded-lg hover:bg-navy-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CKB</span>
              </div>
              <div>
                <p className="font-medium text-white">CKB</p>
                <p className="text-sm text-gray-400">Nervos CKB</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">{formatBalance(balance)}</p>
              <p className="text-sm text-gray-400">≈ $0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
