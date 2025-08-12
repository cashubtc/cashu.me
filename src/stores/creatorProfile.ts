import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export interface CreatorProfile {
  display_name: string;
  picture: string;
  about: string;
  pubkey: string;
  mints: string[];
  relays: string[];
}

function snapshot(p: CreatorProfile) {
  return JSON.stringify({
    display_name: p.display_name,
    picture: p.picture,
    about: p.about,
    pubkey: p.pubkey,
    mints: p.mints,
    relays: p.relays,
  });
}

export const useCreatorProfileStore = defineStore("creatorProfile", {
  state: () => ({
    display_name: useLocalStorage<string>("creatorProfile.display_name", ""),
    picture: useLocalStorage<string>("creatorProfile.picture", ""),
    about: useLocalStorage<string>("creatorProfile.about", ""),
    pubkey: useLocalStorage<string>("creatorProfile.pubkey", ""),
    mints: useLocalStorage<string[]>("creatorProfile.mints", []),
    relays: useLocalStorage<string[]>("creatorProfile.relays", []),
    _clean: "",
  }),
  getters: {
    profile(state): { display_name: string; picture: string; about: string } {
      return {
        display_name: state.display_name,
        picture: state.picture,
        about: state.about,
      };
    },
    isDirty(state): boolean {
      return snapshot(state as CreatorProfile) !== state._clean;
    },
  },
  actions: {
    setProfile(data: Partial<CreatorProfile>) {
      if (data.display_name !== undefined)
        this.display_name = data.display_name;
      if (data.picture !== undefined) this.picture = data.picture;
      if (data.about !== undefined) this.about = data.about;
      if (data.pubkey !== undefined) this.pubkey = data.pubkey;
      if (data.mints !== undefined) this.mints = [...data.mints];
      if (data.relays !== undefined) this.relays = [...data.relays];
    },
    markClean() {
      this._clean = snapshot(this as CreatorProfile);
    },
  },
});
