import React, { useEffect, useState } from "react";
import { useLightClient } from "../contexts";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AssetsTab } from "./tabs/AssetsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { SendTab } from "./tabs/SendTab";
import { ReceiveTab } from "./tabs/ReceiveTab";
import { NetworkTab } from "./tabs/NetworkTab";

export const NostrWallet: React.FC = () => {
  const { stopPeersUpdate } = useLightClient();
  const [activeTab, setActiveTab] = useState<"assets" | "activity" | "send" | "receive" | "network">("assets");

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
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 主内容区 */}
        <main className="flex-1 min-h-[calc(100vh-80px)] space-y-6">
          {activeTab === "assets" && <AssetsTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "send" && <SendTab />}
          {activeTab === "receive" && <ReceiveTab />}
          {activeTab === "network" && <NetworkTab />}
        </main>
      </div>
    </div>
  );
};
