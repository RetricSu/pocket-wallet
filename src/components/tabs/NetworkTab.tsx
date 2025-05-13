import React, { useState } from "react";
import { useLightClient } from "../../contexts";
import { patchLightClientBigintType } from "../../utils/stringUtils";
import { ScriptStatus } from "ckb-light-client-js";
import { BlockHeaderListView } from "../features/BlockHeaderListView";

interface NetworkTabProps {}

export const NetworkTab: React.FC<NetworkTabProps> = ({}) => {
  const { peers, tipBlockNumber, syncedBlockNumber, client, localNode } = useLightClient();
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("localNode: ", localNode);
  const handleGetScriptStatus = async () => {
    try {
      setIsLoading(true);
      const scripts = await client.lightClient.getScripts();
      setScriptStatus(scripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-bg-secondary/30 rounded-lg p-6 border border-border/20">
        <div className="flex items-center gap-4 mb-4">
          <img src="/images/pocket-wallet-logo.png" className="w-16" alt="Pocket Wallet Logo" />
          <h2 className="text-xl font-medium text-text-primary">We Love Client-Side-Validation!</h2>
        </div>
        <div className="text-text-secondary text-sm">
          <p>
            CKB is a public blockchain based on POW and UTXO-like data structure. Pocket Wallet use CKB Light Client to
            sync the blockchain right in your browser without relying on any centralized RPC service. By integrating
            Nostr with Nip46 and more, Pocket Wallet provides a fully verifiable wallet experience in the methodology of
            client-side-validation and POW verifications.
          </p>
        </div>
      </div>

      {/* Light Client Status Section */}
      <div className="bg-bg-secondary/30 rounded-lg p-6 border border-border/20">
        <h3 className="text-lg font-medium text-text-primary mb-4">Wasm Light Client Status</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary font-medium w-32">Active:</span>
              <span className="text-primary font-medium">{localNode?.active ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary font-medium w-32">Client Version:</span>
              <span className="text-primary">{localNode?.version}</span>
            </div>
            <div>
              <span className="text-text-secondary font-medium block mb-1">NodeId:</span>
              <span className="text-primary text-sm break-all">{localNode?.nodeId}</span>
            </div>
            <div>
              <span className="text-text-secondary font-medium block mb-1">Protocol:</span>
              <div className="text-primary text-sm overflow-x-auto">
                {JSON.stringify(localNode?.protocols.map((protocol) => protocol.name))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-text-secondary font-medium block mb-1">Tip Block Number:</span>
              <a
                href={`https://testnet.explorer.nervos.org/block/${patchLightClientBigintType(tipBlockNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover"
              >
                {patchLightClientBigintType(tipBlockNumber)}
              </a>
            </div>
            <div>
              <span className="text-text-secondary font-medium block mb-1">Synced Block Number:</span>
              <a
                href={`https://testnet.explorer.nervos.org/block/${patchLightClientBigintType(syncedBlockNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover"
              >
                {patchLightClientBigintType(syncedBlockNumber)}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Peers Section */}
      <div className="bg-bg-secondary/30 rounded-lg p-6 border border-border/20">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            Connected Peers({Array.isArray(peers) ? peers.length : 0})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-border/20">
            <thead>
              <tr className="text-left text-sm font-medium text-text-secondary">
                <th className="px-4 py-2">Node ID</th>
                <th className="px-4 py-2 w-24 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {Array.isArray(peers) && peers.length > 0 ? (
                peers.map((peer, idx: number) => (
                  <tr key={idx} className="text-sm text-text-primary hover:bg-white/5">
                    <td className="px-4 py-2 font-mono text-xs">{peer.nodeId}</td>
                    <td className="px-4 py-2 text-right">
                      {Math.floor(Number(peer.connestedDuration) / 1000 / 60)} min
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-center text-text-secondary">
                    No peers connected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Header List View */}
      <div className="bg-bg-secondary/30 rounded-lg p-6 border border-border/20">
        <BlockHeaderListView />
      </div>

      {/* Scripts Section */}
      <div className="bg-bg-secondary/30 rounded-lg p-6 border border-border/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-text-primary">Scripts</h3>
            <p className="text-text-secondary text-sm">Scripts allow light client to find interesting data it wants</p>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-secondary hover:bg-primary/80 text-sm font-medium"
            onClick={handleGetScriptStatus}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Get Scripts"}
          </button>
        </div>

        <div className="bg-bg-secondary/50 border border-border/20 rounded-lg p-4 max-h-[300px] overflow-auto">
          {scriptStatus ? (
            <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap">
              {JSON.stringify(
                scriptStatus.map((script) => {
                  return {
                    scriptType: script.scriptType,
                    script: script.script,
                    blockNumber: script.blockNumber.toString(10),
                  };
                }),
                null,
                2,
              )}
            </pre>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">Click "Get Scripts" to view</p>
          )}
        </div>
      </div>
    </div>
  );
};
