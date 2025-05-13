export const APP_CONFIG = {
  signInMethodCacheKeyName: "sign-in-method-cache",
  nip46BunkerSecretKeyName: "nostr-nip46-bunker-secret-key",
  nip46BunkerStringListKeyName: "nostr-nip46-bunker-string-list",
  lightClientSyncingSecretKeyName: "light-client-syncing-secret-key",
  defaultStartBlockNumber: BigInt(13783286),
  defaultUpdateSyncStatusInterval: 3000,
  defaultRelays: ["wss://relay.nostr.band", "wss://relay.damus.io", "wss://relay.snort.net"],
};
