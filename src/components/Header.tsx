import { useLightClient } from "../contexts";
import { NetworkIcon } from "./icons/network";
import { SyncIcon } from "./icons/sync";
import { patchLightClientBigintType } from "../utils/stringUtils";
export const Header = () => {
  const { connections, tipBlockNumber, syncedBlockNumber, isUpdatingPeers } = useLightClient();

  const syncedPercentage =
    syncedBlockNumber && tipBlockNumber ? (Number(syncedBlockNumber) / Number(tipBlockNumber)) * 100 : 0;
  const truncatedPercentage = Math.floor(syncedPercentage * 10000) / 10000;

  return (
    <header className="w-full max-w-6xl mx-auto px-4 bg-navy-800 shadow-md">
      <div className="flex justify-between items-center py-4 gap-8">
        <h1 className="text-2xl font-bold text-blue-400">Nostr Wallet</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <NetworkIcon />
            {patchLightClientBigintType(connections)}
          </div>
          <div className="group relative flex items-center gap-2 text-sm text-gray-400">
            <SyncIcon isUpdating={isUpdatingPeers && truncatedPercentage < 100} />
            <span>{truncatedPercentage.toFixed(4)}%</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-navy-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
              <div className="text-xs">
                <div>Tip Block {tipBlockNumber?.toString() || "-"}</div>
                <div>
                  Synced behind{" "}
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
