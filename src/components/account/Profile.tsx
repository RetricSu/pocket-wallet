import { useNostrSigner } from "../../contexts";
import { truncateString } from "../../utils/stringUtils";
import { CopyButton } from "../common/CopyButton";
import { ProfileImg } from "../common/ProfileImg";
import { useEffect, useMemo, useState } from "react";
import { nip19 } from "nostr-tools";
import { nostrService } from "../../services/nostr";
import useLocalStorage from "../../hooks/useLocalStorage";
import { SignInMethodCache } from "./SignIn";
import { APP_CONFIG } from "../../lib/app-config";

export const Profile = () => {
  const { nostrPublicKey, recommendedAddress, disconnect } = useNostrSigner();
  const [profile, setProfile] = useState<{ name: string; about: string; picture: string } | null>(null);
  const [_, setSignInMethodCache] = useLocalStorage<SignInMethodCache | null>(
    APP_CONFIG.signInMethodCacheKeyName,
    null,
  );

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

  const handleDisconnect = () => {
    disconnect();
    setSignInMethodCache(null);
  };

  return (
    <div className="rounded-xl shadow-lg border p-4 border-neutral-200 relative">
      <div className="flex flex-col items-center mb-6">
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
          <button className="text-xs text-text-secondary/60" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};
