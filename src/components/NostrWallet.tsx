import { ccc } from "@ckb-ccc/core";
import React, { useEffect, useState } from "react";
import configRaw from "../lib/config.toml";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { randomSecretKey, RemoteNode } from "ckb-light-client-js";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";

export const NostrWallet: React.FC = () => {
  const [nostrAccount, setNostrAccount] = useState<{ publicKey: string; privateKey: string }>({
    publicKey: "f879eb8207a69c1429267ab666cf722f18edc8549253e81be5a1ef93513e14dc",
    privateKey: "fda2c1f734627f6c4c4220858f8630dbdf778a4bfaee4c657cb4a91ef5c56333",
  });

  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [peers, setPeers] = useState<RemoteNode[]>([]);

  const client = new LightClientPublicTestnet({
    lightClientConfig: configRaw,
    syncingKey: randomSecretKey(),
  });

  const signer = new ccc.SignerNostrPrivateKey(client, nostrAccount.privateKey);

  const getBalance = async () => {
    const tipHeader = await client.getTipHeader();
    console.log("tipHeader.number: ", tipHeader.number);
    const addrs = await signer.getAddressObjs();
    const searchKey = {
      scriptType: "lock",
      script: addrs[0].script,
      scriptSearchMode: "prefix",
    } as ClientCollectableSearchKeyLike;
    const capacity = await client.getCellsCapacity(searchKey);
    console.log(addrs[0], capacity);
    setBalance(capacity);
  };

  const updatePeers = async () => {
    await client.startSync();
    while (true) {
      console.log("updatePeers...");
      const peers = await client.getPeers();
      setPeers(peers);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  return (
    <div>
      <div>
        <p>Nostr Account: {nostrAccount.publicKey}</p>
      </div>
      <div className="overflow-x-auto">
        <div>
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={updatePeers}>
            Update Peers
          </button>
        </div>
	<div>{peers.length}</div>
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Addresses
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
                <td className="px-6 py-4 text-sm text-gray-900">
                  <ul className="list-disc pl-5 space-y-1">
                    {item.addresses.map((itemAddr) => (
                      <li key={itemAddr.address} className="break-all">
                        {itemAddr.address} （{Number(itemAddr.score)}）
                      </li>
                    ))}
                  </ul>
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
