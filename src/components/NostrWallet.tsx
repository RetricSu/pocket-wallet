import React, { useEffect, useState } from "react";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";
import { useLightClient, useNostrSigner } from "../contexts";

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
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isUpdatingPeers, setIsUpdatingPeers] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"assets" | "activity" | "send" | "receive" | "network">("assets");

  useEffect(() => {
    signer.getRecommendedAddress().then(setRecommendedAddress);
  }, [signer]);

  const getBalance = async () => {
    try {
      setIsLoading(true);
      if (!isInitialized) {
        await initializeClient();
      }
      const addr = await signer.getRecommendedAddressObj();
      const searchKey = {
        scriptType: "lock",
        script: addr.script,
        scriptSearchMode: "prefix",
      } as ClientCollectableSearchKeyLike;
      const balance = await client.getBalanceSingle(addr.script);
      setBalance(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Helper function to format large numbers
  const formatBalance = (balance: bigint | null): string => {
    if (balance === null) return "0";
    const balanceStr = balance.toString();
    return new Intl.NumberFormat().format(Number(balanceStr));
  };

  // Helper function to truncate long strings
  const truncateString = (str: string, first = 8, last = 8): string => {
    if (!str) return "";
    if (str.length <= first + last) return str;
    return `${str.slice(0, first)}...${str.slice(-last)}`;
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header with Network Selector */}
      <header className="bg-navy-800 shadow-md">
        <div className="w-full max-w-6xl mx-auto px-4 flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-blue-400">Nostr Wallet</h1>
          <div className="flex items-center gap-4">
            <select className="bg-navy-700 text-blue-300 font-semibold px-5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:bg-navy-600 transition-colors shadow-none">
              <option>Mainnet</option>
              <option>Testnet</option>
            </select>
            <button className="bg-navy-700/50 p-2 rounded-lg hover:bg-navy-700 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 主体区域，左右两栏布局 */}
      <div className="w-full max-w-6xl mx-auto flex gap-8 py-10 px-4">
        {/* 左侧边栏 */}
        <aside className="w-72 min-h-[calc(100vh-80px)] bg-navy-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
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
          <div className="mt-10">
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

        {/* 主内容区 */}
        <main className="flex-1 min-h-[calc(100vh-80px)] space-y-6">
          {activeTab === "assets" && (
            <div className="space-y-6">
              {/* Total Balance Card */}
              <div className="bg-navy-800/80 rounded-2xl p-8 flex items-center justify-between shadow-lg backdrop-blur-sm">
                <div>
                  <h2 className="text-lg font-medium text-gray-400 mb-2">Total Balance</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-300">{formatBalance(balance)}</span>
                    <span className="text-gray-400">CKB</span>
                  </div>
                </div>
                <button
                  className="px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-500 text-base font-semibold"
                  onClick={getBalance}
                >
                  Refresh Balance
                </button>
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
          )}

          {activeTab === "activity" && (
            <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-lg font-medium text-gray-400 mb-4">Transaction History</h2>
              <div className="text-center py-8 text-gray-500">No transactions yet</div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
              <h2 className="text-lg font-medium text-gray-400 mb-6">Send CKB</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Enter recipient address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <button className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-500 font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === "receive" && (
            <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
              <h2 className="text-lg font-medium text-gray-400 mb-6">Receive CKB</h2>
              <div className="space-y-6">
                <div className="bg-navy-700/30 p-6 rounded-lg text-center">
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg mb-6 shadow-lg">
                    {/* QR Code placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-navy-900">QR Code</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Your CKB Address</p>
                  <p className="text-blue-300 break-all mb-4">{recommendedAddress}</p>
                  <button className="px-6 py-2.5 bg-navy-700 rounded-lg hover:bg-navy-600 text-sm transition-colors">
                    Copy Address
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "network" && (
            <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-lg font-medium text-gray-400 mb-4">Network Status</h2>
              <div className="mb-4">
                <span className="text-gray-400">Initialized: </span>
                <span className={isInitialized ? "text-green-400" : "text-red-400"}>
                  {isInitialized ? "Yes" : "No"}
                </span>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">Peers: </span>
                <span className="text-blue-300">{Array.isArray(peers) ? peers.length : 0}</span>
                <ul className="mt-2 ml-4 list-disc text-sm text-gray-300">
                  {Array.isArray(peers) && peers.length > 0 ? (
                    peers.map((peer: any, idx: number) => (
                      <li key={idx}>{typeof peer === "string" ? peer : JSON.stringify(peer)}</li>
                    ))
                  ) : (
                    <li>No peers</li>
                  )}
                </ul>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">Connections: </span>
                <span className="text-blue-300">{Array.isArray(connections) ? connections.length : 0}</span>
                <ul className="mt-2 ml-4 list-disc text-sm text-gray-300">
                  {Array.isArray(connections) && connections.length > 0 ? (
                    connections.map((conn: any, idx: number) => (
                      <li key={idx}>{typeof conn === "string" ? conn : JSON.stringify(conn)}</li>
                    ))
                  ) : (
                    <li>No connections</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="text-gray-400">Tip Block Number: </span>
                <span className="text-blue-300">
                  {tipBlockNumber !== undefined && tipBlockNumber !== null ? String(tipBlockNumber) : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Synced Block Number: </span>
                <span className="text-blue-300">
                  {syncedBlockNumber !== undefined && syncedBlockNumber !== null ? String(syncedBlockNumber) : "-"}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
