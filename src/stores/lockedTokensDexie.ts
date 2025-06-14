import { defineStore } from "pinia";
import { ref } from "vue";
import { cashuDb, type LockedToken } from "./dexie";
import { liveQuery } from "dexie";
import { v4 as uuidv4 } from "uuid";

export const useDexieLockedTokensStore = defineStore(
  "dexieLockedTokens",
  () => {
    const lockedTokens = ref<LockedToken[]>([]);

    liveQuery(() => cashuDb.lockedTokens.toArray()).subscribe({
      next: (rows) => {
        lockedTokens.value = rows;
      },
      error: (err) => console.error(err),
    });

    async function addLockedToken(
      data: Omit<LockedToken, "id"> & { id?: string }
    ) {
      const entry: LockedToken = { id: data.id ?? uuidv4(), ...data };
      await cashuDb.lockedTokens.put(entry);
      return entry;
    }

    async function deleteLockedToken(id: string) {
      await cashuDb.lockedTokens.delete(id);
    }

    return { lockedTokens, addLockedToken, deleteLockedToken };
  }
);
