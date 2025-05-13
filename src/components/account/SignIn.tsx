import { useLightClient } from "../../contexts";
import { Nip07 } from "@ckb-ccc/nip07";
import { useNostrSigner } from "../../contexts";
import { base64ToUint8Array, uint8ArrayToBase64 } from "../../utils/stringUtils";
import { useEffect, useState } from "react";
import { generateSecretKey } from "nostr-tools";
import { createNip46Signer } from "../../lib/ccc/Nip46";
import useLocalStorage from "../../hooks/useLocalStorage";
import { APP_CONFIG } from "../../lib/app-config";
import { BunkerConnectModal } from "../modal/BunkerConnectModal";
import { useNip46BunkerStringListCache } from "../../hooks/useNip46BunkerStringListCache";

export type SignInMethodCache = {
  type: "nip07" | "nip46";
  bunkerString?: string;
};

export const SignIn = () => {
  const { setSigner } = useNostrSigner();
  const { client } = useLightClient();
  const { addBunkerString, isBunkerStringInCache } = useNip46BunkerStringListCache();

  const [nip46SecretKeyCache, setNip46SecretKeyCache] = useLocalStorage<string | null>(
    APP_CONFIG.nip46BunkerSecretKeyName,
    null,
  );
  const [signInMethodCache, setSignInMethodCache] = useLocalStorage<SignInMethodCache | null>(
    APP_CONFIG.signInMethodCacheKeyName,
    null,
  );

  const [isNip07Loading, setIsNip07Loading] = useState(false);
  const [isNip46Loading, setIsNip46Loading] = useState(false);
  const [isNip46ModalOpen, setIsNip46ModalOpen] = useState(false);
  const [isAutoReConnecting, setIsAutoReConnecting] = useState(false);

  const nip07SignIn = async () => {
    setIsNip07Loading(true);
    try {
      const signer = Nip07.getNip07Signer(client);
      setSigner(signer);
      setSignInMethodCache({ type: "nip07" });
      return true;
    } catch (error) {
      console.error("Failed to connect with NIP-07:", error);
      return false;
    } finally {
      setIsNip07Loading(false);
    }
  };

  const nip46SignIn = async (bunkerString: string, isAutoConnect: boolean = false) => {
    setIsNip46Loading(true);
    try {
      let nip46SecretKey: Uint8Array;
      if (nip46SecretKeyCache === null) {
        nip46SecretKey = generateSecretKey();
        setNip46SecretKeyCache(uint8ArrayToBase64(nip46SecretKey));
      } else {
        nip46SecretKey = base64ToUint8Array(nip46SecretKeyCache);
      }

      const signer = createNip46Signer(client, nip46SecretKey);
      if (isAutoConnect) {
        await signer.reconnectToBunker(bunkerString);
      } else if (isBunkerStringInCache(bunkerString)) {
        // this is a familiar bunker string, so we can reconnect to it
        await signer.reconnectToBunker(bunkerString);
      } else {
        await signer.connectToBunker(bunkerString);
      }

      setSigner(signer);
      setSignInMethodCache({
        type: "nip46",
        bunkerString,
      });
      addBunkerString(bunkerString);
      return true;
    } catch (error) {
      console.error("Failed to connect to Bunker:", error);
      return false;
    } finally {
      setIsNip46Loading(false);
    }
  };

  const autoReConnect = async () => {
    if (!signInMethodCache || isAutoReConnecting) return;

    setIsAutoReConnecting(true);
    try {
      console.log("Auto-reconnecting with method:", signInMethodCache.type);
      let success = false;

      if (signInMethodCache.type === "nip07") {
        success = await nip07SignIn();
      } else if (signInMethodCache.type === "nip46" && signInMethodCache.bunkerString) {
        success = await nip46SignIn(signInMethodCache.bunkerString, true);
      }

      if (!success) {
        console.warn("Auto-reconnect failed, please try again later");
      }
    } catch (error) {
      console.error("Failed to auto-reconnect:", error);
    } finally {
      setIsAutoReConnecting(false);
    }
  };

  useEffect(() => {
    autoReConnect();
  }, [signInMethodCache]);

  return (
    <div className="rounded-xl shadow-lg border p-4 border-neutral-200 relative">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex flex-col items-center pt-2">
          <p className="text-xs text-text-secondary/60 text-center">
            {isAutoReConnecting ? "Reconnecting..." : "Sign in to use wallet"}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <button
          className={`w-full py-3 px-4 rounded-lg border border-primary flex items-center justify-center gap-2 font-medium transition-colors ${
            isNip46Loading || isAutoReConnecting
              ? "bg-neutral-100 text-neutral-400"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
          onClick={() => {
            setIsNip46ModalOpen(true);
          }}
          disabled={isNip46Loading || isAutoReConnecting}
        >
          {isNip46Loading ? "Wait for Bunker..." : "Bunker (NIP-46)"}
        </button>

        <button
          className={`w-full py-3 px-4 rounded-lg border border-neutral-300 flex items-center justify-center gap-2 font-medium transition-colors ${
            isNip07Loading || isAutoReConnecting
              ? "bg-neutral-100 text-neutral-400"
              : "bg-white text-text-primary hover:bg-neutral-100"
          }`}
          onClick={() => nip07SignIn()}
          disabled={isNip07Loading || isAutoReConnecting}
        >
          {isNip07Loading ? "Wait for Extension..." : "Extension (NIP-07)"}
        </button>
      </div>

      <BunkerConnectModal
        isOpen={isNip46ModalOpen}
        onClose={() => setIsNip46ModalOpen(false)}
        onConnect={nip46SignIn}
        isLoading={isNip46Loading}
      />
    </div>
  );
};
