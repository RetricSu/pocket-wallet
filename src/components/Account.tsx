import { useLightClient } from "../contexts";
import { Nip07 } from "@ckb-ccc/nip07";
import { useNostrSigner } from "../contexts";
import { truncateString } from "../utils/stringUtils";
import { CopyButton } from "./common/CopyButton";
import { AccountIcon } from "./icons/account";
import { ProfileImg } from "./ProfileImg";
import { useEffect, useMemo, useState } from "react";
import { nip19 } from "nostr-tools";
import { nostrService } from "../services/nostr";

export const Account = () => {
  const { isConnected, nostrPublicKey, recommendedAddress, disconnect } = useNostrSigner();
  const [profile, setProfile] = useState<{ name: string; about: string; picture: string } | null>(null);

  const npub = useMemo(() => {
    if (nostrPublicKey) {
      return nip19.npubEncode(nostrPublicKey.slice(2));
    }
    return "";
  }, [nostrPublicKey]);

  const getUserProfile = async () => {
    if (!nostrPublicKey) return null;

    const profile = await nostrService.getProfile(nostrPublicKey.slice(2));
    setProfile(profile);
  };

  useEffect(() => {
    getUserProfile();
  }, [nostrPublicKey]);

  if (!isConnected) {
    return <SignInAccount />;
  }

  return (
    <div className="rounded-xl shadow-lg border p-4 border-neutral-200 relative">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
          <ProfileImg imageUrl={profile?.picture} />
        </div>
        <h3 className="text-lg font-bold text-text-primary">{profile?.name || "Account"}</h3>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-center gap-2 bg-neutral-100 rounded-md px-3 py-2">
            <CopyButton
              textToCopy={npub}
              defaultMessage={truncateString(npub, 8, 8)}
              successMessage="Copied!"
              className="font-mono text-xs text-neutral-800 break-all select-all text-center"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 bg-neutral-100 rounded-md px-3 py-2">
            <CopyButton
              textToCopy={recommendedAddress || ""}
              defaultMessage={truncateString(recommendedAddress || "", 8, 8)}
              successMessage="Copied!"
              className="font-mono text-xs text-neutral-800 break-all select-all text-center"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button className="text-xs text-text-secondary/60" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export const SignInAccount = () => {
  const { setSigner } = useNostrSigner();
  const { client } = useLightClient();
  const [isLoading, setIsLoading] = useState(false);

  const nip07SignIn = () => {
    setIsLoading(true);
    // NIP-07 extension sign-in would be implemented here
    const signer = Nip07.getNip07Signer(client);
    setSigner(signer);
    setIsLoading(false);
  };

  return (
    <div className="rounded-xl shadow-lg border p-4 border-neutral-200 relative">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex flex-col items-center pt-2">
          <p className="text-xs text-text-secondary/60 text-center">Sign in to use wallet</p>
        </div>
      </div>
      <div className="space-y-4">
        <button
          className={`w-full py-3 px-4 rounded-lg border border-primary flex items-center justify-center gap-2 font-medium transition-colors ${isLoading ? "bg-neutral-100 text-neutral-400" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
          onClick={nip07SignIn}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Extension (NIP-07)"}
        </button>

        <button
          className={`w-full py-3 px-4 rounded-lg border border-neutral-300 flex items-center justify-center gap-2 font-medium transition-colors ${isLoading ? "bg-neutral-100 text-neutral-400" : "bg-white text-text-primary hover:bg-neutral-100"}`}
          onClick={() => {
            setIsLoading(true);
            // NIP-46 nsecbunker sign-in would be implemented here
            setTimeout(() => setIsLoading(false), 1000); // Simulating loading state
          }}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "NSECBunker (NIP-46)"}
        </button>
      </div>
    </div>
  );
};
