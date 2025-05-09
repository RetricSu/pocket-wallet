import React from "react";

interface NetworkTabProps {
  isInitialized: boolean;
  peers: any[];
  tipBlockNumber: bigint | null;
  syncedBlockNumber: bigint | null;
  setupPeersUpdate: () => Promise<void>;
  stopPeersUpdateHandler: () => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({
  isInitialized,
  peers,
  tipBlockNumber,
  syncedBlockNumber,
  setupPeersUpdate,
  stopPeersUpdateHandler,
}) => {
  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-4">Network Status</h2>
      <div className="mb-4">
        <span className="text-gray-400">Initialized: </span>
        <span className={isInitialized ? "text-green-400" : "text-red-400"}>{isInitialized ? "Yes" : "No"}</span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
          onClick={setupPeersUpdate}
        >
          Start Peers Update
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
          onClick={stopPeersUpdateHandler}
        >
          Stop Peers Update
        </button>
      </div>
      <div className="mb-4">
        <span className="text-gray-400">Peers: </span>
        <span className="text-blue-300">{Array.isArray(peers) ? peers.length : 0}</span>
        <ul className="mt-2 ml-4 list-disc text-sm text-gray-300">
          {Array.isArray(peers) && peers.length > 0 ? (
            peers.map((peer, idx: number) => <li key={idx}>{peer.nodeId}</li>)
          ) : (
            <li>No peers</li>
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
  );
};
