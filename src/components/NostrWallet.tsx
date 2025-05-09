import React from "react";
import { Header } from "./Header";
import { Sidebar, TabItem } from "./Sidebar";
import { AssetsTab } from "./tabs/AssetsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { SendTab } from "./tabs/SendTab";
import { ReceiveTab } from "./tabs/ReceiveTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { AssetsIcon } from "./icons/assets";
import { ActivityIcon } from "./icons/activity";
import { SendIcon } from "./icons/send";
import { ReceiveIcon } from "./icons/receive";
import { NetworkSidebarIcon } from "./icons/network-sidebar";

const tabItems: TabItem[] = [
  {
    id: "assets",
    label: "Assets",
    icon: <AssetsIcon />,
    content: <AssetsTab />,
  },
  {
    id: "activity",
    label: "Activity",
    icon: <ActivityIcon />,
    content: <ActivityTab />,
  },
  {
    id: "send",
    label: "Send",
    icon: <SendIcon />,
    content: <SendTab />,
  },
  {
    id: "receive",
    label: "Receive",
    icon: <ReceiveIcon />,
    content: <ReceiveTab />,
  },
  {
    id: "network",
    label: "Network",
    icon: <NetworkSidebarIcon />,
    content: <NetworkTab />,
  },
];

export const NostrWallet: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <Sidebar items={tabItems} defaultActiveId="assets" />
      </div>
    </div>
  );
};
