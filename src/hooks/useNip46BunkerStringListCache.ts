import { useLocalStorage } from "./useLocalStorage";
import { APP_CONFIG } from "../lib/app-config";

export const useNip46BunkerStringListCache = () => {
  const [nip46BunkerStringListCache, setNip46BunkerStringListCache] = useLocalStorage<string[] | null>(
    APP_CONFIG.nip46BunkerStringListKeyName,
    null,
  );

  const addBunkerStringToCacheList = (bunkerString: string) => {
    if (nip46BunkerStringListCache === null) {
      setNip46BunkerStringListCache([bunkerString]);
    } else {
      // don't store duplicate bunker strings
      if (!nip46BunkerStringListCache.includes(bunkerString)) {
        setNip46BunkerStringListCache([...nip46BunkerStringListCache, bunkerString]);
      }
    }
  };

  const removeBunkerStringFromCacheList = (bunkerString: string) => {
    if (nip46BunkerStringListCache === null) {
      return;
    }
    setNip46BunkerStringListCache(nip46BunkerStringListCache.filter((val) => val !== bunkerString));
  };

  return {
    nip46BunkerStringListCache,
    addBunkerString: addBunkerStringToCacheList,
    removeBunkerString: removeBunkerStringFromCacheList,
  };
};
