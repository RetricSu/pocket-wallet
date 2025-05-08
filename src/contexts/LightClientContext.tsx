import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { LightClientSetScriptsCommand, randomSecretKey } from "ckb-light-client-js";
import { RemoteNode } from "ckb-light-client-js";
import configRaw from "../lib/config.toml";

// Light Client Context
export interface LightClientContextType {
  client: LightClientPublicTestnet;
  isInitialized: boolean;
  peers: RemoteNode[];
  connections: bigint | null;
  tipBlockNumber: bigint | null;
  syncedBlockNumber: bigint | null;
  startPeersUpdate: () => void;
  stopPeersUpdate: () => void;
  initializeClient: (script?: any) => Promise<void>;
}

const LightClientContext = createContext<LightClientContextType | undefined>(undefined);

export const LightClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [peers, setPeers] = useState<RemoteNode[]>([]);
  const [connections, setConnections] = useState<bigint | null>(null);
  const [tipBlockNumber, setTipBlockNumber] = useState<bigint | null>(null);
  const [syncedBlockNumber, setSyncedBlockNumber] = useState<bigint | null>(null);
  const [clientReady, setClientReady] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<LightClientPublicTestnet | null>(null);

  // 只初始化一次客户端
  useEffect(() => {
    if (!clientRef.current) {
      const client = new LightClientPublicTestnet({
        lightClientConfig: configRaw,
        syncingKey: randomSecretKey(),
      });
      clientRef.current = client;
      setClientReady(true);
    }

    return () => {
      stopPeersUpdate();
      // 组件卸载时清理资源
      if (clientRef.current) {
        clientRef.current = null;
      }
    };
  }, []);

  const updatePeers = async () => {
    if (!clientRef.current) return;

    try {
      const peers = await clientRef.current.getPeers();
      const localNodeInfo = await clientRef.current.localNodeInfo();
      const tipHeader = await clientRef.current.getTipHeader();
      const res = await clientRef.current.getScripts();

      // 设置新数据前清理旧数据
      setPeers([]);
      setConnections(null);
      setTipBlockNumber(null);
      setSyncedBlockNumber(null);

      // 设置新数据
      setPeers(peers);
      setConnections(localNodeInfo.connections);
      setTipBlockNumber(tipHeader.number);
      setSyncedBlockNumber(res[0]?.blockNumber);
    } catch (error) {
      console.error("Failed to update peers:", error);
      // 出错时停止更新
      stopPeersUpdate();
    }
  };

  const startPeersUpdate = () => {
    if (intervalRef.current) return;
    updatePeers(); // 立即更新一次
    intervalRef.current = setInterval(updatePeers, 5000); // 5-second interval
  };

  const stopPeersUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const initializeClient = useCallback(
    async (script?: any) => {
      try {
        if (clientRef.current && !isInitialized) {
          await clientRef.current.startSync();

          if (script) {
            await clientRef.current.setScripts(
              [{ blockNumber: BigInt(17107327), script, scriptType: "lock" }],
              LightClientSetScriptsCommand.All,
            );
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize client:", error);
      }
    },
    [isInitialized],
  );

  // Ensure client is available before providing context
  if (!clientRef.current || !clientReady) {
    return <div>Loading light client...</div>; // Show a loading indicator
  }

  return (
    <LightClientContext.Provider
      value={{
        client: clientRef.current,
        isInitialized,
        peers,
        connections,
        startPeersUpdate,
        stopPeersUpdate,
        initializeClient,
        tipBlockNumber,
        syncedBlockNumber,
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
