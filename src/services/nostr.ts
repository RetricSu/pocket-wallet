import { nip19 } from "nostr-tools";
import { APP_CONFIG } from "../lib/app-config";
import { Subscribe } from "./subscribe";

export interface ProfileInfo {
  name: string;
  about: string;
  picture: string;
  nostrPublicKey: string;
  npub: string;
}

export class NostrService {
  private subscribe: Subscribe;
  private cache: Map<string, any> = new Map();
  relays: string[];

  constructor(relays?: string[]) {
    this.subscribe = new Subscribe();
    this.relays = relays || APP_CONFIG.defaultRelays;
  }

  async getFollowerProfiles(nostrPublicKey: string) {
    const followers = await this.getFollowList(nostrPublicKey);
    const profiles = await Promise.all(followers.map((follower: string) => this.getProfile(follower)));
    return profiles.filter((profile) => profile !== null);
  }

  async getFollowList(nostrPublicKey: string) {
    const cacheKey = `followList:${nostrPublicKey}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const followListEvents = await this.subscribe.query(this.relays, {
      kinds: [3],
      authors: [nostrPublicKey],
    });
    if (followListEvents.length === 0) {
      this.cache.set(cacheKey, []);
      return [];
    }
    const followListEvent = followListEvents[0];
    const followList = followListEvent.tags.filter((tag) => tag[0] === "p").map((tag) => tag[1]);

    // Cache the result
    this.cache.set(cacheKey, followList);
    return followList;
  }

  async getProfile(nostrPublicKey: string) {
    const cacheKey = `profile:${nostrPublicKey}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const events = await this.subscribe.query(this.relays, {
      kinds: [0],
      authors: [nostrPublicKey],
    });
    if (events.length === 0) {
      this.cache.set(cacheKey, null);
      return null;
    }
    const metadataEvent = events[0];
    const profile: { name: string; about: string; picture: string } = JSON.parse(metadataEvent.content);
    const profileInfo: ProfileInfo = {
      name: profile.name,
      about: profile.about,
      picture: profile.picture,
      nostrPublicKey,
      npub: nip19.npubEncode(nostrPublicKey),
    };

    // Cache the result
    this.cache.set(cacheKey, profileInfo);
    return profileInfo;
  }

  clearCache() {
    this.cache.clear();
  }

  disconnect() {
    this.subscribe.destroy(this.relays);
  }
}

export const nostrService = new NostrService();
