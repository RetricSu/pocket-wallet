import { ccc } from "@ckb-ccc/core";
import { Nip07 } from "@ckb-ccc/nip07";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { useLightClient } from "./LightClientContext";
import { LightClientSetScriptsCommand } from "ckb-light-client-js";
import { APP_CONFIG } from "../lib/app-config";

// Signer Context
export interface NostrSignerContextType {
  signer: ccc.SignerNostrPrivateKey | Nip07.Signer | null | undefined;
  recommendedAddress: string | null;
  recommendedAddressObj: ccc.Address | null;
  nostrPublicKey: string | null;
  isConnected: boolean;
  setSigner: (signer: ccc.SignerNostrPrivateKey | Nip07.Signer | null | undefined) => void;
  disconnect: () => void;
}

const NostrSignerContext = createContext<NostrSignerContextType | undefined>(undefined);

export const NostrSignerProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { client, isClientStarted: isClientStart } = useLightClient();
  const [nostrPublicKey, setNostrPublicKey] = useState<string | null>(null);
  const [recommendedAddressObj, setRecommendedAddressObj] = useState<ccc.Address | null>(null);
  const [recommendedAddress, setRecommendedAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const signerRef = useRef<ccc.SignerNostrPrivateKey | Nip07.Signer | null | undefined>(null);

  const setSigner = useCallback((signer: ccc.SignerNostrPrivateKey | Nip07.Signer | null | undefined) => {
    signerRef.current = signer;
    setIsConnected(!!signer);
  }, []);

  const disconnect = useCallback(() => {
    signerRef.current = null;
    setRecommendedAddressObj(null);
    setRecommendedAddress(null);
    setNostrPublicKey(null);
    setIsConnected(false);
  }, []);

  // initialize signer
  useEffect(() => {
    return () => {
      signerRef.current = null;
      setIsConnected(false);
    };
  }, []);

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

  return (
    <NostrSignerContext.Provider
      value={{
        signer: signerRef.current,
        recommendedAddress,
        recommendedAddressObj,
        nostrPublicKey,
        isConnected,
        setSigner,
        disconnect,
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
