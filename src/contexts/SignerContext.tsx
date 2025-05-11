import { ccc } from "@ckb-ccc/core";
import { Nip07 } from "@ckb-ccc/nip07";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { useLightClient } from "./LightClientContext";
import { LightClientSetScriptsCommand } from "ckb-light-client-js";
import { APP_CONFIG } from "../lib/app-config";

// Signer Context
export interface NostrSignerContextType {
  signer: ccc.SignerNostrPrivateKey | Nip07.Signer;
  recommendedAddress: string | null;
  recommendedAddressObj: ccc.Address | null;
  nostrPublicKey: string | null;
  setNostrAccount: (account: { publicKey: string; privateKey: string }) => void;
}

const NostrSignerContext = createContext<NostrSignerContextType | undefined>(undefined);

export const NostrSignerProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { client, isClientStarted: isClientStart } = useLightClient();
  const [nostrAccount, setNostrAccount] = useState<{ publicKey: string; privateKey: string }>({
    publicKey: "f879eb8207a69c1429267ab666cf722f18edc8549253e81be5a1ef93513e14dc",
    privateKey: "fda2c1f734627f6c4c4220858f8630dbdf778a4bfaee4c657cb4a91ef5c56333",
  });
  const [nostrPublicKey, setNostrPublicKey] = useState<string | null>(null);
  const [signerReady, setSignerReady] = useState(false);
  const [recommendedAddressObj, setRecommendedAddressObj] = useState<ccc.Address | null>(null);
  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const signerRef = useRef<ccc.SignerNostrPrivateKey | Nip07.Signer | null>(null);

  // initialize signer
  useEffect(() => {
    const nip07Signer = Nip07.getNip07Signer(client);
    signerRef.current = nip07Signer ?? new ccc.SignerNostrPrivateKey(client, nostrAccount.privateKey);
    setSignerReady(true);

    return () => {
      signerRef.current = null;
      setSignerReady(false);
    };
  }, [client]);

  const updateSignerInfo = useCallback(async () => {
    if (signerRef.current) {
      const [addressObj, address, publicKey] = await Promise.all([
        signerRef.current.getRecommendedAddressObj(),
        signerRef.current.getRecommendedAddress(),
        signerRef.current.getNostrPublicKey(),
      ]);
      setRecommendedAddress(address);
      setNostrPublicKey(publicKey);
      setRecommendedAddressObj(addressObj);
    }
  }, [signerRef.current]);

  useEffect(() => {
    updateSignerInfo();
  }, [updateSignerInfo]);

  const tryResetScriptsIfNeeded = useCallback(async () => {
    if (!recommendedAddressObj) return;
    if (!isClientStart) return;

    try {
      const scriptStatus = await client.lightClient.getScripts();
      console.debug("get script status...", scriptStatus);
      if (
        !scriptStatus.find(
          (s) =>
            s.script.args === recommendedAddressObj.script.args &&
            s.script.codeHash === recommendedAddressObj.script.codeHash &&
            s.script.hashType === recommendedAddressObj.script.hashType &&
            s.scriptType === "lock",
        )
      ) {
        console.log("tryResetScriptsIfNeeded...", recommendedAddressObj.script);
        await client.lightClient.setScripts(
          [
            {
              script: recommendedAddressObj.script,
              scriptType: "lock",
              blockNumber: APP_CONFIG.defaultStartBlockNumber,
            },
          ],
          LightClientSetScriptsCommand.All,
        );
      }
    } catch (error: unknown) {
      console.error("Failed to reset scripts", error);
    }
  }, [recommendedAddressObj, isClientStart]);

  useEffect(() => {
    tryResetScriptsIfNeeded();
  }, [tryResetScriptsIfNeeded]);

  // Ensure signer is available before providing context
  if (!signerRef.current || !signerReady) {
    return <div>Loading Nostr signer...</div>; // Show a loading indicator
  }

  return (
    <NostrSignerContext.Provider
      value={{
        signer: signerRef.current,
        recommendedAddress,
        recommendedAddressObj,
        nostrPublicKey,
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
