import React, { useEffect, useState } from "react";
import { useLightClient, useNostrSigner } from "../contexts";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AssetsTab } from "./tabs/AssetsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { SendTab } from "./tabs/SendTab";
import { ReceiveTab } from "./tabs/ReceiveTab";
import { NetworkTab } from "./tabs/NetworkTab";

export const NostrWallet: React.FC = () => {
  const {
    client,
    peers,
    connections,
    startPeersUpdate,
    stopPeersUpdate,
    isInitialized,
    initializeClient,
    tipBlockNumber,
    syncedBlockNumber,
  } = useLightClient();
  const { signer, nostrAccount } = useNostrSigner();

  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const [isUpdatingPeers, setIsUpdatingPeers] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"assets" | "activity" | "send" | "receive" | "network">("assets");

  useEffect(() => {
    signer.getRecommendedAddress().then(setRecommendedAddress);
  }, [signer]);

  const setupPeersUpdate = async () => {
    try {
      if (!isInitialized) {
        await initializeClient();
      }
      setIsUpdatingPeers(true);
      startPeersUpdate();
    } catch (error) {
      console.error("Failed to start peers update:", error);
    }
  };

  const stopPeersUpdateHandler = () => {
    stopPeersUpdate();
    setIsUpdatingPeers(false);
  };

  useEffect(() => {
    return () => {
      stopPeersUpdate();
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <Header />

      {/* 主体区域，左右两栏布局 */}
      <div className="w-full max-w-6xl mx-auto flex gap-8 py-10 px-4">
        {/* 左侧边栏 */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          nostrAccount={nostrAccount}
          recommendedAddress={recommendedAddress}
        />

        {/* 主内容区 */}
        <main className="flex-1 min-h-[calc(100vh-80px)] space-y-6">
          {activeTab === "assets" && <AssetsTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "send" && <SendTab />}
          {activeTab === "receive" && <ReceiveTab recommendedAddress={recommendedAddress} />}
          {activeTab === "network" && (
            <NetworkTab
              isInitialized={isInitialized}
              peers={peers}
              tipBlockNumber={tipBlockNumber}
              syncedBlockNumber={syncedBlockNumber}
              setupPeersUpdate={setupPeersUpdate}
              stopPeersUpdateHandler={stopPeersUpdateHandler}
            />
          )}
        </main>
      </div>
    </div>
  );
};
