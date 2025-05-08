import { ccc } from "@ckb-ccc/core";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, useMemo } from "react";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { LightClientSetScriptsCommand, randomSecretKey } from "ckb-light-client-js";
import { RemoteNode } from "ckb-light-client-js";
import configRaw from "../lib/config.toml";

interface NostrContextType {
  client: LightClientPublicTestnet;
  signer: ccc.SignerNostrPrivateKey;
  nostrAccount: {
    publicKey: string;
    privateKey: string;
  };
  setNostrAccount: (account: { publicKey: string; privateKey: string }) => void;
  isInitialized: boolean;
  peers: RemoteNode[];
  connections: bigint | null;
  tipBlockNumber: bigint | null;
  syncedBlockNumber: bigint | null;
  startPeersUpdate: () => void;
  stopPeersUpdate: () => void;
  initializeClient: () => Promise<void>;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

export const NostrProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nostrAccount, setNostrAccount] = useState<{ publicKey: string; privateKey: string }>({
    publicKey: "f879eb8207a69c1429267ab666cf722f18edc8549253e81be5a1ef93513e14dc",
    privateKey: "fda2c1f734627f6c4c4220858f8630dbdf778a4bfaee4c657cb4a91ef5c56333",
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [peers, setPeers] = useState<RemoteNode[]>([]);
  const [connections, setConnections] = useState<bigint | null>(null);
  const [tipBlockNumber, setTipBlockNumber] = useState<bigint | null>(null);
  const [syncedBlockNumber, setSyncedBlockNumber] = useState<bigint | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<LightClientPublicTestnet | null>(null);
  const signerRef = useRef<ccc.SignerNostrPrivateKey | null>(null);

  // 只初始化一次客户端
  useEffect(() => {
    if (!clientRef.current) {
      const client = new LightClientPublicTestnet({
        lightClientConfig: configRaw,
        syncingKey: randomSecretKey(),
      });
      clientRef.current = client;
      signerRef.current = new ccc.SignerNostrPrivateKey(client, nostrAccount.privateKey);
    }

    return () => {
      stopPeersUpdate();
      // 组件卸载时清理资源
      if (clientRef.current) {
        clientRef.current = null;
      }
      signerRef.current = null;
    };
  }, []);

  // 当nostrAccount变化时更新signer
  useEffect(() => {
    if (clientRef.current) {
      signerRef.current = new ccc.SignerNostrPrivateKey(clientRef.current, nostrAccount.privateKey);
    }
  }, [nostrAccount]);

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
    intervalRef.current = setInterval(updatePeers, 5000); // 增加间隔到5秒
  };

  const stopPeersUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const initializeClient = useCallback(async () => {
    try {
      if (clientRef.current && !isInitialized && signerRef.current) {
        await clientRef.current.startSync();
        const addr = await signerRef.current.getRecommendedAddressObj();
        await clientRef.current.setScripts(
          [{ blockNumber: BigInt(17107327), script: addr.script, scriptType: "lock" }],
          LightClientSetScriptsCommand.All,
        );
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Failed to initialize client:", error);
    }
  }, [isInitialized]);

  return (
    <NostrContext.Provider
      value={{
        client: clientRef.current!,
        signer: signerRef.current!,
        nostrAccount,
        setNostrAccount,
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
    </NostrContext.Provider>
  );
};

export const useNostr = () => {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error("useNostr must be used within a NostrProvider");
  }
  return context;
};
