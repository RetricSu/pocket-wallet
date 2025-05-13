import { useLocalStorage } from "./useLocalStorage";
import { APP_CONFIG } from "../lib/app-config";

interface BunkerEntry {
  bunkerString: string;
  createdAt: number;
}

export const useNip46BunkerStringListCache = () => {
  const [nip46BunkerStringListCache, setNip46BunkerStringListCache] = useLocalStorage<BunkerEntry[] | null>(
    APP_CONFIG.nip46BunkerStringListKeyName,
    null,
  );

  // Helper function to sort entries by createdAt in descending order (newest first)
  const sortEntriesByCreatedAt = (entries: BunkerEntry[]): BunkerEntry[] => {
    return [...entries].sort((a, b) => b.createdAt - a.createdAt);
  };

  const addBunkerStringToCacheList = (bunkerString: string) => {
    const newEntry: BunkerEntry = {
      bunkerString,
      createdAt: Date.now(),
    };

    if (nip46BunkerStringListCache === null) {
      setNip46BunkerStringListCache([newEntry]);
    } else {
      // don't store duplicate bunker strings
      if (!nip46BunkerStringListCache.some((entry) => entry.bunkerString === bunkerString)) {
        const updatedCache = [...nip46BunkerStringListCache, newEntry];
        // Sort entries before saving
        setNip46BunkerStringListCache(sortEntriesByCreatedAt(updatedCache));
      } else {
        // If the bunker string already exists, update its timestamp to current time
        const updatedCache = nip46BunkerStringListCache.map((entry) =>
          entry.bunkerString === bunkerString ? { ...entry, createdAt: Date.now() } : entry,
        );
        // Sort entries before saving
        setNip46BunkerStringListCache(sortEntriesByCreatedAt(updatedCache));
      }
    }
  };

  const removeBunkerStringFromCacheList = (bunkerString: string) => {
    if (nip46BunkerStringListCache === null) {
      return;
    }
    setNip46BunkerStringListCache(nip46BunkerStringListCache.filter((entry) => entry.bunkerString !== bunkerString));
  };

  const isBunkerStringInCache = (bunkerString: string): boolean => {
    if (nip46BunkerStringListCache === null) {
      return false;
    }
    return nip46BunkerStringListCache.some((entry) => entry.bunkerString === bunkerString);
  };

  return {
    nip46BunkerStringListCache,
    addBunkerString: addBunkerStringToCacheList,
    removeBunkerString: removeBunkerStringFromCacheList,
    isBunkerStringInCache,
  };
};
