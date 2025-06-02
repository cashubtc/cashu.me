import { defineStore } from "pinia";
import { useNostrStore } from "./nostr";
import { nip19 } from "nostr-tools";

export const FEATURED_CREATORS = [
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
  "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "1111111111111111111111111111111111111111111111111111111111111111",
  "2222222222222222222222222222222222222222222222222222222222222222",
  "3333333333333333333333333333333333333333333333333333333333333333",
];

export interface CreatorProfile {
  pubkey: string;
  profile: any;
  followers: number;
  following: number;
  joined: number | null;
}

export const useCreatorsStore = defineStore("creators", {
  state: () => ({
    searchResults: [] as CreatorProfile[],
    searching: false,
    error: "",
  }),
  actions: {
    async searchCreators(query: string) {
      const nostrStore = useNostrStore();
      this.searchResults = [];
      this.error = "";
      if (!query) {
        return;
      }
      this.searching = true;
      await nostrStore.initNdkReadOnly();
      let pubkey = query.trim();
      if (pubkey.startsWith("npub")) {
        try {
          const decoded = nip19.decode(pubkey);
          pubkey = typeof decoded.data === "string" ? (decoded.data as string) : "";
        } catch (e) {
          console.error(e);
          this.error = "Invalid npub";
          this.searching = false;
          return;
        }
      } else if (!/^[0-9a-fA-F]{64}$/.test(pubkey)) {
        this.error = "Invalid pubkey";
        this.searching = false;
        return;
      }
      try {
        const user = nostrStore.ndk.getUser({ pubkey });
        await user.fetchProfile();
        const followers = await nostrStore.fetchFollowerCount(pubkey);
        const following = await nostrStore.fetchFollowingCount(pubkey);
        const joined = await nostrStore.fetchJoinDate(pubkey);
        this.searchResults.push({
          pubkey,
          profile: user.profile,
          followers,
          following,
          joined,
        });
      } catch (e) {
        console.error(e);
      } finally {
        this.searching = false;
      }
    },

    async loadFeaturedCreators() {
      const nostrStore = useNostrStore();
      this.searchResults = [];
      this.error = "";
      this.searching = true;
      await nostrStore.initNdkReadOnly();
      for (const pubkey of FEATURED_CREATORS) {
        try {
          const user = nostrStore.ndk.getUser({ pubkey });
          await user.fetchProfile();
          const followers = await nostrStore.fetchFollowerCount(pubkey);
          const following = await nostrStore.fetchFollowingCount(pubkey);
          const joined = await nostrStore.fetchJoinDate(pubkey);
          this.searchResults.push({
            pubkey,
            profile: user.profile,
            followers,
            following,
            joined,
          });
        } catch (e) {
          console.error(e);
        }
      }
      this.searching = false;
    },
  },
});
