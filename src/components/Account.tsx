import { useNostrSigner } from "../contexts";
import { truncateString } from "../utils/stringUtils";

export const Account = () => {
  const { nostrAccount, recommendedAddress } = useNostrSigner();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Account</h3>
      <div className="space-y-5">
        <div className="p-3 bg-secondary-hover rounded-xl border border-border/50">
          <p className="text-xs text-text-secondary mb-1 font-medium">Nostr Public Key</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-primary font-medium break-all">{truncateString(nostrAccount.publicKey, 8, 8)}</p>
            <button className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
              Copy
            </button>
          </div>
        </div>
        <div className="p-3 bg-secondary-hover rounded-xl border border-border/50">
          <p className="text-xs text-text-secondary mb-1 font-medium">Address</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-primary font-medium break-all">{truncateString(recommendedAddress || "", 8, 8)}</p>
            <button className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
