import { ccc } from "@ckb-ccc/core";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { LightClientPublicTestnet } from "../lib/ccc/LightClientPublicTestnet";
import { randomSecretKey } from "ckb-light-client-js";
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
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

export const NostrProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nostrAccount, setNostrAccount] = useState<{ publicKey: string; privateKey: string }>({
    publicKey: "f879eb8207a69c1429267ab666cf722f18edc8549253e81be5a1ef93513e14dc",
    privateKey: "fda2c1f734627f6c4c4220858f8630dbdf778a4bfaee4c657cb4a91ef5c56333",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const client = new LightClientPublicTestnet({
    lightClientConfig: configRaw,
    syncingKey: randomSecretKey(),
  });

  const signer = new ccc.SignerNostrPrivateKey(client, nostrAccount.privateKey);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        //await client.startSync();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize client:", error);
        // 这里可以添加错误处理逻辑
      }
    };

    initializeClient();
  }, [client]);

  if (!isInitialized) {
    return <div>Initializing...</div>; // 或者使用一个加载组件
  }

  return (
    <NostrContext.Provider value={{ client, signer, nostrAccount, setNostrAccount, isInitialized }}>
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
