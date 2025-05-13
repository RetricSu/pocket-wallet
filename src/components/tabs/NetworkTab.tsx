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
    <div className="mb-2">
      <div>
        <div className="flex justify-start gap-2 items-center align-middle">
          <img src="/images/pocket-wallet-logo.png" className="w-20" />
          <h2 className="text-xl font-medium text-text-primary">We Love Client-Side-Validation!</h2>
        </div>
        <div className="text-text-secondary text-sm p-2">
          <p>
            CKB is a public blockchain based on POW and UTXO-like data structure. Pocket Wallet use CKB Light Client to
            sync the blockchain right in your browser without relying on any centralized RPC service. By integrating
            Nostr with Nip46 and more, Pocket Wallet provides a fully verifiable wallet experience in the methodology of
            client-side-validation and POW verifications.
          </p>
        </div>
      </div>

      <div className="my-4">
        <div className="text-md font-medium">Wasm Light Client Status</div>
        <div className="p-2 text-sm flex justify-start gap-10">
          <div>
            <div className="flex justify-start gap-6">
              <div>
                <span className="text-text-primary">Active: </span>
                <span className="text-primary">{localNode?.active ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-text-primary">Light Client Version: </span>
                <span className="text-primary">{localNode?.version}</span>
              </div>
            </div>
            <div>
              <span className="text-text-primary">NodeId: </span>
              <span className="text-primary">{localNode?.nodeId}</span>
            </div>
            <div className="max-w-[400px] overflow-x-scroll whitespace-nowrap">
              <span className="text-text-primary">Protocol: </span>
              <span className="text-primary">
                {JSON.stringify(localNode?.protocols.map((protocol) => protocol.name))}
              </span>
            </div>
          </div>
          <div>
            <div>
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
        </div>
      </div>

      <hr className="border-border/20" />

      <div className="my-4">
        <span className="text-text-primary font-medium">Connected Peers</span>
        <span className="text-primary">({Array.isArray(peers) ? peers.length : 0})</span>
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
      <hr className="border-border/20" />

      <BlockHeaderListView />

      <div className="my-6">
        <div className="flex flex-col space-y-4">
          <button
            className="btn w-fit border border-border/40 px-4 py-2 rounded-lg bg-primary text-secondary hover:bg-primary/80"
            onClick={handleGetScriptStatus}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Get Scripts"}
          </button>

          <div className="mt-2 p-4 rounded bg-bg-secondary/30 border border-border/20 max-h-[300px] overflow-auto">
            {scriptStatus ? (
              <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap">
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
              <p className="text-text-secondary text-sm">Click "Get Scripts" to view the scripts data</p>
            )}
          </div>
        </div>
      </div>

      <br />
      <br />
    </div>
  );
};
