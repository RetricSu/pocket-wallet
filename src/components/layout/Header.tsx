import { useLightClient } from "../../contexts";
import { NodesIcon } from "../icons/nodes";
import { SyncIcon } from "../icons/sync";
import { patchLightClientBigintType } from "../../utils/stringUtils";

export const Header = () => {
  const {
    client,
    tipBlockNumber,
    syncedBlockNumber,
    localNode,
    isUpdatingSyncStatus: isUpdatingPeers,
    peers,
  } = useLightClient();

  const syncedPercentage =
    syncedBlockNumber && tipBlockNumber ? (Number(syncedBlockNumber) / Number(tipBlockNumber)) * 100 : 0;
  const truncatedPercentage = Math.floor(syncedPercentage * 10000) / 10000;

  return (
    <header className="w-full bg-background/80 backdrop-blur-sm fixed top-0 left-0 z-40 border-b border-border/30">
      <div className="px-6 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/images/pocket-wallet-logo.png" alt="Pocket Wallet Logo" className="h-10" />
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pocket Wallet
              </div>
              <p className="text-xs text-text-secondary">Manage CKB independently with Nostr</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-text-secondary">CKB {client.networkType}</div>
            <div className="group relative flex items-center gap-2 text-sm text-text-secondary">
              <NodesIcon />
              <span className="font-medium">{patchLightClientBigintType(localNode?.connections)}</span>
              <div className="absolute top-full right-0 mt-2 px-4 py-3 bg-secondary rounded-xl shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-border z-10">
                <div className="text-xs text-text-secondary">
                  <div className="mb-1">
                    Connected Peers <span className="font-medium">{Array.isArray(peers) ? peers.length : 0}</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto mt-2">
                    {Array.isArray(peers) && peers.length > 0 ? (
                      peers.map((peer, idx) => (
                        <div key={idx} className="mb-1 border-t border-border/20 pt-1">
                          <div className="font-mono text-[10px] truncate max-w-48">{peer.nodeId}</div>
                          <div className="text-[10px]">
                            {Math.floor(Number(peer.connestedDuration) / 1000 / 60)} min
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">No peers</div>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-8 -translate-y-1/2 rotate-45 w-2 h-2 bg-secondary border-t border-l border-border"></div>
              </div>
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

            <div>
              <div className="flex flex-col items-center justify-center gap-2">
                <a
                  className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium"
                  href="https://github.com/RetricSu/pocket-wallet"
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
