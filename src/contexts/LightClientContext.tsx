import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { LightClientSetScriptsCommand, randomSecretKey, ScriptStatus } from "ckb-light-client-js";
import { RemoteNode } from "ckb-light-client-js";
import configRaw from "../lib/config.toml";
import useLocalStorage from "../hooks/useLocalStorage";
import { APP_CONFIG } from "../lib/app-config";
import { Hex } from "@ckb-ccc/core";

export interface LightClientContextType {
  client: LightClientPublicTestnet;
  isClientReady: boolean;
  isClientStarted: boolean;
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
  const [lightClientSyncingSecretKey, setLightClientSyncingSecretKey] = useLocalStorage<Hex | null>(
    APP_CONFIG.lightClientSyncingSecretKeyName,
    null,
  );

  const [isClientReady, setIsClientReady] = useState(false);
  const [isStartingClient, setIsStartingClient] = useState(false);
  const [isClientStarted, setIsClientStarted] = useState(false);
  const [isUpdatingSyncStatus, setIsUpdatingSyncStatus] = useState(false);
  const [peers, setPeers] = useState<RemoteNode[]>([]);
  const [connections, setConnections] = useState<bigint | null>(null);
  const [tipBlockNumber, setTipBlockNumber] = useState<bigint | null>(null);
  const [syncedBlockNumber, setSyncedBlockNumber] = useState<bigint | null>(null);

  const syncStatusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<LightClientPublicTestnet | null>(null);

  // only initialize the client once
  useEffect(() => {
    if (!clientRef.current) {
      let syncingKey = lightClientSyncingSecretKey;
      if (!syncingKey) {
        console.warn("[LightClientProvider] light client syncing secret key is not set, setting a random secret key");
        syncingKey = randomSecretKey();
        setLightClientSyncingSecretKey(syncingKey);
      }
      const client = new LightClientPublicTestnet({
        lightClientConfig: configRaw,
        syncingKey: syncingKey,
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
        setIsClientStarted(false);
        setIsStartingClient(false);
      }
    };
  }, []);

  const startLightClient = useCallback(
    async (scripts?: ScriptStatus[], command?: LightClientSetScriptsCommand) => {
      try {
        if (!isClientReady || !clientRef.current) {
          return console.log(`light-client is not initialized, abort...`);
        }
        if (isStartingClient) {
          return console.log(`light-client is already in starting, abort...`);
        }
        if (isClientStarted) {
          return console.log(`light-client is already started, abort...`);
        }

        console.log("startLightClient...", scripts, command);
        setIsStartingClient(true);
        await clientRef.current.start();
        if (scripts && scripts.length > 0) {
          await clientRef.current.lightClient.setScripts(scripts, command);
        }
        //await new Promise((resolve) => setTimeout(resolve, 10000));
        setIsClientStarted(true);
      } catch (error) {
        console.error("Failed to initialize client:", error);
        setIsClientStarted(false);
      } finally {
        setIsStartingClient(false);
      }
    },
    [isClientReady],
  );
  useEffect(() => {
    startLightClient();
  }, [startLightClient]);

  const stopUpdateSyncStatus = useCallback(() => {
    if (syncStatusIntervalRef.current) {
      clearInterval(syncStatusIntervalRef.current);
      syncStatusIntervalRef.current = null;
      setIsUpdatingSyncStatus(false);
    }
  }, []);

  const updateSyncStatus = async () => {
    console.log("[updateSyncStatus] updating sync status...");
    try {
      const [peers, localNodeInfo, tipHeader, res] = await Promise.all([
        clientRef.current!.lightClient.getPeers(),
        clientRef.current!.lightClient.localNodeInfo(),
        clientRef.current!.lightClient.getTipHeader(),
        clientRef.current!.lightClient.getScripts(),
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
      console.error("Failed to update sync status:", error);
    }
  };

  const startUpdateSyncStatus = useCallback(async () => {
    if (syncStatusIntervalRef.current || isUpdatingSyncStatus) {
      console.warn("updateSyncStatus is already running");
      return;
    }
    if (!clientRef.current || !isClientStarted) {
      console.warn("[updateSyncStatus] light client is not initialized or not started");
      return;
    }

    await updateSyncStatus();
    // update once immediately
    setIsUpdatingSyncStatus(true);
    syncStatusIntervalRef.current = setInterval(updateSyncStatus, APP_CONFIG.defaultUpdateSyncStatusInterval); // 3-second interval
  }, [clientRef.current, isClientStarted, updateSyncStatus]);

  useEffect(() => {
    startUpdateSyncStatus();
  }, [startUpdateSyncStatus]);

  // Ensure client is available before providing context
  if (!clientRef.current || !isClientReady || !isClientStarted) {
    return <div>Loading light client...</div>; // Show a loading indicator
  }

  return (
    <LightClientContext.Provider
      value={{
        isClientReady,
        client: clientRef.current,
        isClientStarted,
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
