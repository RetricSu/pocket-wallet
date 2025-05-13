import React from "react";
import { Header } from "./layout/Header";
import { SideNav, TabItem } from "./layout/SideNav";
import { AssetsTab } from "./tabs/AssetsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { SendTab } from "./tabs/SendTab";
import { ReceiveTab } from "./tabs/ReceiveTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { AssetsIcon } from "./icons/assets";
import { ActivityIcon } from "./icons/activity";
import { SendIcon } from "./icons/send";
import { ReceiveIcon } from "./icons/receive";
import { NetworkIcon } from "./icons/network";
import { NavigationProvider } from "../contexts";
import { Account } from "./account";

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
    icon: <NetworkIcon />,
    content: <NetworkTab />,
  },
];

export const PocketWallet: React.FC = () => {
  return (
    <NavigationProvider defaultActiveId="assets">
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <SideNav items={tabItems} customHeader={<Account />} />
      </div>
    </NavigationProvider>
  );
};
