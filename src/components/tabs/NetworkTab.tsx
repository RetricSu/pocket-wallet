import React, { useState } from "react";
import { useLightClient } from "../../contexts";
import { patchLightClientBigintType } from "../../utils/stringUtils";
import { NetworkIcon } from "../icons/network";
import { SyncIcon } from "../icons/sync";

interface NetworkTabProps {}

export const NetworkTab: React.FC<NetworkTabProps> = ({}) => {
  const {
    isClientStart: isInitialized,
    peers,
    connections,
    tipBlockNumber,
    syncedBlockNumber,
    startUpdateSyncStatus: startPeersUpdate,
    stopUpdateSyncStatus: stopPeersUpdate,
  } = useLightClient();

  const [isUpdatingPeers, setIsUpdatingPeers] = useState<boolean>(false);

  const setupPeersUpdate = async () => {
    try {
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

  const syncedPercentage =
    syncedBlockNumber && tipBlockNumber ? (Number(syncedBlockNumber) / Number(tipBlockNumber)) * 100 : 0;
  const truncatedPercentage = Math.floor(syncedPercentage * 10000) / 10000;

  return (
    <>
      <h2 className="text-lg font-medium text-text-primary mb-4">
        <span className="mr-2">Network Status</span>
        <span className={isInitialized ? "text-green-400" : "text-red-400"}>{isInitialized ? "✔️" : "-"}</span>
      </h2>
      <div className="mb-4 flex justify-start items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <NetworkIcon />
            {patchLightClientBigintType(connections)}
          </div>
          <div className="group relative flex items-center gap-2 text-sm text-text-primary">
            <SyncIcon isUpdating={isUpdatingPeers && truncatedPercentage < 100} />
            <span>{truncatedPercentage.toFixed(4)}%</span>
          </div>
        </div>
        <button
          className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors"
          onClick={setupPeersUpdate}
        >
          Update
        </button>
        <button
          className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors"
          onClick={stopPeersUpdateHandler}
        >
          Stop Update
        </button>
      </div>
      <div className="my-4">
        <div className="mb-2">
          <span className="text-text-primary">Tip Block Number: </span>
          <span className="text-primary">
            <a
              href={`https://testnet.explorer.nervos.org/block/${patchLightClientBigintType(tipBlockNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-hover"
            >
              {patchLightClientBigintType(tipBlockNumber)}
            </a>
          </span>
        </div>
        <div>
          <span className="text-text-primary">Synced Block Number: </span>
          <span className="text-primary">
            <a
              href={`https://testnet.explorer.nervos.org/block/${patchLightClientBigintType(syncedBlockNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-hover"
            >
              {patchLightClientBigintType(syncedBlockNumber)}
            </a>
          </span>
        </div>
      </div>
      <hr className="border-border/20" />
      <div className="my-4">
        <span className="text-text-primary">Peers: </span>
        <span className="text-primary">{Array.isArray(peers) ? peers.length : 0}</span>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-border/20">
            <thead>
              <tr className="text-left text-sm font-medium text-text-primary">
                <th className="px-4 py-2">Node ID</th>
                <th className="px-4 py-2">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {Array.isArray(peers) && peers.length > 0 ? (
                peers.map((peer, idx: number) => (
                  <tr key={idx} className="text-sm text-text-primary hover:bg-white/5">
                    <td className="px-4 py-2 font-mono">{peer.nodeId}</td>
                    <td className="px-4 py-2">{Math.floor(Number(peer.connestedDuration) / 1000 / 60)} min</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-center text-text-secondary">
                    No peers
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
