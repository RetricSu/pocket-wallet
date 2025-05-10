import { useNostrSigner } from "../contexts";
import { truncateString } from "../utils/stringUtils";
import { CopyButton } from "./common/CopyButton";
import { AccountIcon } from "./icons/account";
export const Account = () => {
  const { nostrAccount, recommendedAddress } = useNostrSigner();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
          <AccountIcon />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary tracking-wide">ACCOUNT</h3>
          <p className="text-sm text-text-secondary/70">disconnect</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-text-secondary/70 mb-1.5">Nostr Public Key</p>
          <div className="flex items-center gap-2">
            <CopyButton
              textToCopy={nostrAccount.publicKey}
              defaultMessage={truncateString(nostrAccount.publicKey, 8, 8)}
              className="text-base text-accent font-medium"
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary/70 mb-1.5">Address</p>
          <div className="flex items-center gap-2">
            <CopyButton
              textToCopy={recommendedAddress || ""}
              defaultMessage={truncateString(recommendedAddress || "", 8, 8)}
              successMessage="Copied!"
              className="text-base text-accent font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
