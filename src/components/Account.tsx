import { useNostrSigner } from "../contexts";
import { truncateString } from "../utils/stringUtils";
import { CopyButton } from "./common/CopyButton";
import { AccountIcon } from "./icons/account";

export const Account = () => {
  const { nostrPublicKey, recommendedAddress } = useNostrSigner();

  return (
    <div className=" rounded-xl shadow-lg border p-4 border-neutral-200 relative">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
          <AccountIcon />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Account</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-text-secondary/60 font-semibold mb-1 tracking-wider">Nostr Public Key</p>
          <div className="flex items-center gap-2 bg-neutral-100 rounded-md px-3 py-2">
            <CopyButton
              textToCopy={nostrPublicKey || ""}
              defaultMessage={truncateString(nostrPublicKey || "", 8, 8)}
              successMessage="Copied!"
              className="font-mono text-xs text-neutral-800 break-all select-all"
            />
          </div>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary/60 font-semibold mb-1 tracking-wider">CKB Address</p>
          <div className="flex items-center gap-2 bg-neutral-100 rounded-md px-3 py-2">
            <CopyButton
              textToCopy={recommendedAddress || ""}
              defaultMessage={truncateString(recommendedAddress || "", 8, 8)}
              successMessage="Copied!"
              className="font-mono text-xs text-neutral-800 break-all select-all"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button className="text-xs text-text-secondary/60">Disconnect</button>
        </div>
      </div>
    </div>
  );
};
