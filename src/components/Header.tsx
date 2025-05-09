import { useLightClient } from "../contexts";
import { NetworkIcon } from "./icons/network";
import { SyncIcon } from "./icons/sync";
import { patchLightClientBigintType } from "../utils/stringUtils";

export const Header = () => {
  const { connections, tipBlockNumber, syncedBlockNumber, isUpdatingSyncStatus: isUpdatingPeers } = useLightClient();

  const syncedPercentage =
    syncedBlockNumber && tipBlockNumber ? (Number(syncedBlockNumber) / Number(tipBlockNumber)) * 100 : 0;
  const truncatedPercentage = Math.floor(syncedPercentage * 10000) / 10000;

  return (
    <header className="w-full h-16 bg-background/80 backdrop-blur-sm fixed top-0 left-0 z-40 border-b border-border/30">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nostr Wallet
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <NetworkIcon />
              <span className="font-medium">{patchLightClientBigintType(connections)}</span>
            </div>
            <div className="group relative flex items-center gap-2 text-sm text-text-secondary">
              <SyncIcon isUpdating={isUpdatingPeers && truncatedPercentage < 100} />
              <span className="font-medium">{truncatedPercentage.toFixed(2)}%</span>
              <div className="absolute top-full right-0 mt-2 px-4 py-3 bg-secondary rounded-xl shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-border z-10">
                <div className="text-xs text-text-secondary">
                  <div className="mb-1">
                    Tip Block <span className="font-medium">{tipBlockNumber?.toString() || "-"}</span>
                  </div>
                  <div>
                    Synced behind{" "}
                    <span className="font-medium">
                      {parseInt(tipBlockNumber?.toString() ?? "0") - parseInt(syncedBlockNumber?.toString() ?? "0")}
                    </span>{" "}
                    blocks
                  </div>
                </div>
                <div className="absolute top-0 right-8 -translate-y-1/2 rotate-45 w-2 h-2 bg-secondary border-t border-l border-border"></div>
              </div>
            </div>
            <select className="bg-transparent text-primary px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 hover:bg-secondary/30 border border-border/40 font-medium transition-colors cursor-pointer">
              <option>Mainnet</option>
              <option>Testnet</option>
            </select>

            <div>
              <div className="flex flex-col items-center justify-center gap-2">
                <a
                  className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium"
                  href="https://github.com/ckb-devrel/ccc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    aria-hidden
                    src="/images/github.svg"
                    alt="github icon"
                    width={18}
                    height={18}
                    className="opacity-80"
                  />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
