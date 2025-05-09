import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { LightClientSetScriptsCommand, randomSecretKey, ScriptStatus } from "ckb-light-client-js";
import { RemoteNode } from "ckb-light-client-js";
import configRaw from "../lib/config.toml";

export interface LightClientContextType {
  client: LightClientPublicTestnet;
  isClientReady: boolean;
  isClientStart: boolean;
  isUpdatingSyncStatus: boolean;
  peers: RemoteNode[];
  connections: bigint | null;
  tipBlockNumber: bigint | null;
  syncedBlockNumber: bigint | null;
  startUpdateSyncStatus: () => void;
  stopUpdateSyncStatus: () => void;
}

const LightClientContext = createContext<LightClientContextType | undefined>(undefined);

export const LightClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isClientReady, setIsClientReady] = useState(false);
  const [isClientStart, setIsClientStart] = useState(false);
  const [isUpdatingSyncStatus, setIsUpdatingSyncStatus] = useState(false);
  const [peers, setPeers] = useState<RemoteNode[]>([]);
  const [connections, setConnections] = useState<bigint | null>(null);
  const [tipBlockNumber, setTipBlockNumber] = useState<bigint | null>(null);
  const [syncedBlockNumber, setSyncedBlockNumber] = useState<bigint | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<LightClientPublicTestnet | null>(null);

  // only initialize the client once
  useEffect(() => {
    if (!clientRef.current) {
      const client = new LightClientPublicTestnet({
        lightClientConfig: configRaw,
        syncingKey: randomSecretKey(),
      });
      clientRef.current = client;
      setIsClientReady(true);
    }

    return () => {
      if (isUpdatingSyncStatus) {
        stopUpdateSyncStatus();
      }
      if (clientRef.current) {
        clientRef.current = null;
        setIsClientReady(false);
        setIsClientStart(false);
      }
    };
  }, []);

  const startLightClient = useCallback(
    async (scripts?: ScriptStatus[], command?: LightClientSetScriptsCommand) => {
      console.log("startLightClient...", scripts, command);
      try {
        if (clientRef.current && !isClientStart) {
          setIsClientStart(true);
          await clientRef.current.start();

          if (scripts && scripts.length > 0) {
            await clientRef.current.lightClient.setScripts(scripts, command);
          }
        }
      } catch (error) {
        console.error("Failed to initialize client:", error);
        setIsClientStart(false);
      }
    },
    [isClientStart, clientRef.current, setIsClientStart],
  );

  useEffect(() => {
    if (!isClientStart) {
      startLightClient();
    }
  }, [isClientStart, startLightClient]);

  function stopUpdateSyncStatus() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsUpdatingSyncStatus(false);
    }
  }

  const updateSyncStatus = useCallback(async () => {
    if (!clientRef.current) {
      setIsUpdatingSyncStatus(false);
      return;
    }

    try {
      const [peers, localNodeInfo, tipHeader, res] = await Promise.all([
        clientRef.current.lightClient.getPeers(),
        clientRef.current.lightClient.localNodeInfo(),
        clientRef.current.lightClient.getTipHeader(),
        clientRef.current.lightClient.getScripts(),
      ]);

      // clean old data before setting new data
      setPeers([]);
      setConnections(null);
      setTipBlockNumber(null);
      setSyncedBlockNumber(null);

      // set new data
      setPeers(peers);
      setConnections(localNodeInfo.connections);
      setTipBlockNumber(tipHeader.number);
      setSyncedBlockNumber(res[0]?.blockNumber);
    } catch (error) {
      console.error("Failed to update peers:", error);
    }
  }, []); // no dependencies, stopUpdateSyncStatus is stable

  function startUpdateSyncStatus() {
    if (intervalRef.current || isUpdatingSyncStatus) {
      console.warn("updateSyncStatus is already running");
      return;
    }
    updateSyncStatus(); // update once immediately
    setIsUpdatingSyncStatus(true);
    intervalRef.current = setInterval(updateSyncStatus, 5000); // 5-second interval
  }

  useEffect(() => {
    startUpdateSyncStatus();
  }, [isClientStart]);

  // Ensure client is available before providing context
  if (!clientRef.current || !isClientReady) {
    return <div>Loading light client...</div>; // Show a loading indicator
  }

  return (
    <LightClientContext.Provider
      value={{
        isClientReady,
        client: clientRef.current,
        isClientStart,
        peers,
        connections,
        tipBlockNumber,
        syncedBlockNumber,
        startUpdateSyncStatus,
        stopUpdateSyncStatus,
        isUpdatingSyncStatus,
      }}
    >
      {children}
    </LightClientContext.Provider>
  );
};

export const useLightClient = () => {
  const context = useContext(LightClientContext);
  if (context === undefined) {
    throw new Error("useLightClient must be used within a LightClientProvider");
  }
  return context;
};
