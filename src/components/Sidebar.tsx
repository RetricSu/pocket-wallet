import React from "react";
import { Account } from "./Account";
import { AssetsIcon } from "./icons/assets";
import { ActivityIcon } from "./icons/activity";
import { SendIcon } from "./icons/send";
import { ReceiveIcon } from "./icons/receive";
import { NetworkSidebarIcon } from "./icons/network-sidebar";

interface SidebarProps {
  activeTab: "assets" | "activity" | "send" | "receive" | "network";
  setActiveTab: (tab: "assets" | "activity" | "send" | "receive" | "network") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-72 min-h-[calc(100vh-150px)] bg-navy-900 rounded-2xl p-6 flex flex-col justify-start gap-10 shadow-xl border-l border-r">
      <Account />
      <hr />
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab("assets")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "assets" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <AssetsIcon />
          Assets
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "activity" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <ActivityIcon />
          Activity
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "send" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <SendIcon />
          Send
        </button>
        <button
          onClick={() => setActiveTab("receive")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "receive" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <ReceiveIcon />
          Receive
        </button>
        <button
          onClick={() => setActiveTab("network")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "network" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <NetworkSidebarIcon />
          Network
        </button>
      </div>
    </aside>
  );
};
