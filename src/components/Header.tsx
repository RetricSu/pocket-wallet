import { useLightClient } from "../contexts";

export const Header = () => {
  const { connections, tipBlockNumber, syncedBlockNumber } = useLightClient();

  const syncedPercentage =
    syncedBlockNumber && tipBlockNumber ? (Number(syncedBlockNumber) / Number(tipBlockNumber)) * 100 : 0;

  const truncatedPercentage = Math.floor(syncedPercentage * 10000) / 10000;

  return (
    <header className="w-full max-w-6xl mx-auto px-4 bg-navy-800 shadow-md">
      <div className="flex justify-between items-center py-4 gap-8">
        <h1 className="text-2xl font-bold text-blue-400">Nostr Wallet</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {connections
              ? typeof connections === "string" && (connections as string).startsWith("0x")
                ? parseInt(connections, 16)
                : connections.toString()
              : 0}
          </div>
          <div className="group relative flex items-center gap-2 text-sm text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${truncatedPercentage < 100 ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{truncatedPercentage.toFixed(4)}%</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-navy-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
              <div className="text-xs">
                <div>Tip Block: {tipBlockNumber?.toString() || "-"}</div>
                <div>
                  Synced {syncedBlockNumber?.toString() || "-"}, behind{" "}
                  {parseInt(tipBlockNumber?.toString() ?? "0") - parseInt(syncedBlockNumber?.toString() ?? "-")} blocks
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-navy-700"></div>
            </div>
          </div>
          <select className="bg-black text-blue-400 px-5 py-2 rounded-lg focus:outline-none hover:bg-navy-600 shadow-none">
            <option>Mainnet</option>
            <option>Testnet</option>
          </select>
        </div>
      </div>
    </header>
  );
};
