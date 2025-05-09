import { ccc } from "@ckb-ccc/core";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useLightClient } from "./LightClientContext";

// Signer Context
export interface NostrSignerContextType {
  signer: ccc.SignerNostrPrivateKey;
  recommendedAddress: string | null;
  nostrAccount: {
    publicKey: string;
    privateKey: string;
  };
  setNostrAccount: (account: { publicKey: string; privateKey: string }) => void;
}

const NostrSignerContext = createContext<NostrSignerContextType | undefined>(undefined);

export const NostrSignerProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { client: lightClient } = useLightClient();
  const [nostrAccount, setNostrAccount] = useState<{ publicKey: string; privateKey: string }>({
    publicKey: "f879eb8207a69c1429267ab666cf722f18edc8549253e81be5a1ef93513e14dc",
    privateKey: "fda2c1f734627f6c4c4220858f8630dbdf778a4bfaee4c657cb4a91ef5c56333",
  });
  const [signerReady, setSignerReady] = useState(false);
  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const signerRef = useRef<ccc.SignerNostrPrivateKey | null>(null);

  // 初始化 signer
  useEffect(() => {
    signerRef.current = new ccc.SignerNostrPrivateKey(lightClient, nostrAccount.privateKey);
    setSignerReady(true);

    return () => {
      signerRef.current = null;
      setSignerReady(false);
    };
  }, [lightClient]);

  // 当nostrAccount变化时更新signer
  useEffect(() => {
    if (lightClient) {
      signerRef.current = new ccc.SignerNostrPrivateKey(lightClient, nostrAccount.privateKey);
      setSignerReady(true);
    }
  }, [nostrAccount, lightClient]);

  useEffect(() => {
    if (signerRef.current) {
      signerRef.current.getRecommendedAddress().then(setRecommendedAddress);
    }
  }, [signerRef.current]);

  // Ensure signer is available before providing context
  if (!signerRef.current || !signerReady) {
    return <div>Loading Nostr signer...</div>; // Show a loading indicator
  }

  return (
    <NostrSignerContext.Provider
      value={{
        signer: signerRef.current,
        recommendedAddress,
        nostrAccount,
        setNostrAccount,
      }}
    >
      {children}
    </NostrSignerContext.Provider>
  );
};

export const useNostrSigner = () => {
  const context = useContext(NostrSignerContext);
  if (context === undefined) {
    throw new Error("useSigner must be used within a SignerProvider");
  }
  return context;
};
