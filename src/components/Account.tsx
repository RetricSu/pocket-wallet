import { useNostrSigner } from "../contexts";
import { truncateString } from "../utils/stringUtils";

export const Account = () => {
  const { nostrAccount, recommendedAddress } = useNostrSigner();

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">Account</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Nostr Public Key</p>
          <p className="text-sm text-blue-300 break-all">{truncateString(nostrAccount.publicKey, 8, 8)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Address</p>
          <p className="text-sm text-blue-300 break-all">{truncateString(recommendedAddress || "", 8, 8)}</p>
        </div>
      </div>
    </div>
  );
};
