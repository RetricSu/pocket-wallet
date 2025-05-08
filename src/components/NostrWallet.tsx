import React, { useEffect, useState } from "react";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";
import { useNostr } from "../contexts/NostrContext";

export const NostrWallet: React.FC = () => {
  const {
    client,
    signer,
    nostrAccount,
    setNostrAccount,
    peers,
    connections,
    startPeersUpdate,
    stopPeersUpdate,
    isInitialized,
    initializeClient,
    tipBlockNumber,
    syncedBlockNumber,
  } = useNostr();
  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [newPublicKey, setNewPublicKey] = useState("");
  const [newPrivateKey, setNewPrivateKey] = useState("");

  const updateAccount = () => {
    if (newPublicKey && newPrivateKey) {
      setNostrAccount({
        publicKey: newPublicKey,
        privateKey: newPrivateKey,
      });
      setNewPublicKey("");
      setNewPrivateKey("");
    }
  };

  const getBalance = async () => {
    try {
      if (!isInitialized) {
        await initializeClient();
      }
      const addr = await signer.getRecommendedAddressObj();
      const searchKey = {
        scriptType: "lock",
        script: addr.script,
        scriptSearchMode: "prefix",
      } as ClientCollectableSearchKeyLike;
      const capacity = await client.getCellsCapacity(searchKey);
      console.log(addr, capacity);
      setBalance(capacity);
    } catch (error) {
      console.error("Failed to get balance:", error);
      setBalance(null);
    }
  };

  const setupPeersUpdate = async () => {
    if (!isInitialized) {
      await initializeClient();
    }
    startPeersUpdate();
  };

  useEffect(() => {
    return () => {
      stopPeersUpdate();
    };
  }, []);

  return (
    <div>
      <div className="mb-4">
        <p className="mb-2">Current Nostr Account: {nostrAccount.publicKey}</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newPublicKey}
            onChange={(e) => setNewPublicKey(e.target.value)}
            placeholder="New Public Key"
            className="p-2 border rounded"
          />
          <input
            type="text"
            value={newPrivateKey}
            onChange={(e) => setNewPrivateKey(e.target.value)}
            placeholder="New Private Key"
            className="p-2 border rounded"
          />
          <button className="bg-green-500 text-white p-2 rounded-md" onClick={updateAccount}>
            Update Account
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div>
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={setupPeersUpdate}>
            Start Peers Update
          </button>
          <button className="bg-red-500 text-white p-2 rounded-md ml-2" onClick={stopPeersUpdate}>
            Stop Peers Update
          </button>
        </div>
        <div>
          peers: {peers.length}, {syncedBlockNumber?.toString()}/{tipBlockNumber?.toString()}
        </div>
        <div>Connections: {+(connections?.toString(10) ?? 0)}</div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Node ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Connected Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {peers.map((item) => (
              <tr key={item.nodeId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nodeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.floor(Number(item.connestedDuration) / 1000 / 60)} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => {
            signer.getRecommendedAddress().then(setRecommendedAddress);
          }}
        >
          Get Nostr Account
        </button>
      </div>
      <div>
        <p>Recommended Address: {recommendedAddress}</p>
      </div>
      <div>
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={getBalance}>
          Get Balance
        </button>
      </div>
      <div>
        <p>Balance: {balance?.toString()}</p>
      </div>
    </div>
  );
};
