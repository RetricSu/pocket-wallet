import React from "react";

interface SidebarProps {
  activeTab: "assets" | "activity" | "send" | "receive" | "network";
  setActiveTab: (tab: "assets" | "activity" | "send" | "receive" | "network") => void;
  nostrAccount: { publicKey: string };
  recommendedAddress: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, nostrAccount, recommendedAddress }) => {
  // Helper function to truncate long strings
  const truncateString = (str: string, first = 8, last = 8): string => {
    if (!str) return "";
    if (str.length <= first + last) return str;
    return `${str.slice(0, first)}...${str.slice(-last)}`;
  };

  return (
    <aside className="w-72 min-h-[calc(100vh-150px)] bg-navy-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl border-l border-r">
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab("assets")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "assets" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
          Assets
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "activity" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="10" cy="10" r="3" fill="currentColor" />
          </svg>
          Activity
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "send" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <span className="inline-block rotate-[-45deg]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          Send
        </button>
        <button
          onClick={() => setActiveTab("receive")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "receive" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <span className="inline-block rotate-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          Receive
        </button>
        <button
          onClick={() => setActiveTab("network")}
          className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
            activeTab === "network" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17v-1a4 4 0 00-3-3.87M7 7V6a4 4 0 013-3.87m0 0A4 4 0 0117 6v1m-7 10a4 4 0 01-4-4V7a4 4 0 014-4h6a4 4 0 014 4v6a4 4 0 01-4 4H7z"
            />
          </svg>
          Network
        </button>
      </div>
      {/* Account Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Account</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Public Key</p>
            <p className="text-sm text-blue-300 break-all">{truncateString(nostrAccount.publicKey, 8, 8)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm text-blue-300 break-all">{truncateString(recommendedAddress || "", 8, 8)}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
