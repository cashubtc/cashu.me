import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { cashuDb } from "./dexie";
import downloadCsv from "../utils/subscriberCsv";
import type { SubStatus, Frequency } from "../types/subscriber";
import { v4 as uuidv4 } from "uuid";

export type SortOption = "next" | "first" | "amount";

const statusStorage = useLocalStorage<string[]>("subscribers.status", []);
const freqStorage = useLocalStorage<string[]>("subscribers.freq", []);
const tierStorage = useLocalStorage<string[]>("subscribers.tier", []);

export const useSubscribersStore = defineStore("subscribers", {
  state: () => ({
    query: useLocalStorage("subscribers.query", ""),
    status: new Set<SubStatus>(statusStorage.value as SubStatus[]),
    freq: new Set<Frequency>(freqStorage.value as Frequency[]),
    tier: new Set<string>(tierStorage.value),
    sort: useLocalStorage<SortOption>("subscribers.sort", "next"),
    visibleColumns: useLocalStorage<string[]>("subscribers.visibleColumns", []),
    density: useLocalStorage<"comfortable" | "compact">(
      "subscribers.density",
      "comfortable",
    ),
    viewMode: useLocalStorage<"table" | "card">(
      "subscribers.viewMode",
      "table",
    ),
    savedViews: [] as Array<{
      id: string;
      name: string;
      state: Record<string, unknown>;
    }>,
    activeViewId: null as string | null,
  }),
  actions: {
    applyFilters(opts: {
      query?: string;
      status?: Set<SubStatus>;
      freq?: Set<Frequency>;
      tier?: Set<string>;
      sort?: SortOption;
    }) {
      if (opts.query !== undefined) {
        this.query = opts.query;
      }
      if (opts.status !== undefined) {
        this.status = new Set(opts.status);
        statusStorage.value = Array.from(this.status);
      }
      if (opts.freq !== undefined) {
        this.freq = new Set(opts.freq);
        freqStorage.value = Array.from(this.freq);
      }
      if (opts.tier !== undefined) {
        this.tier = new Set(opts.tier);
        tierStorage.value = Array.from(this.tier);
      }
      if (opts.sort !== undefined) {
        this.sort = opts.sort;
      }
    },
    clearFilters() {
      this.query = "";
      this.status.clear();
      this.freq.clear();
      this.tier.clear();
      this.sort = "next";
      statusStorage.value = [];
      freqStorage.value = [];
      tierStorage.value = [];
    },
    setViewMode(mode: "table" | "card") {
      this.viewMode = mode;
    },
    toggleColumn(col: string) {
      const idx = this.visibleColumns.indexOf(col);
      if (idx >= 0) {
        this.visibleColumns.splice(idx, 1);
      } else {
        this.visibleColumns.push(col);
      }
    },
    setDensity(d: "comfortable" | "compact") {
      this.density = d;
    },
    async saveCurrentView(name: string) {
      const id = uuidv4();
      const state = {
        query: this.query,
        status: Array.from(this.status),
        freq: Array.from(this.freq),
        tier: Array.from(this.tier),
        sort: this.sort,
        visibleColumns: this.visibleColumns.slice(),
        density: this.density,
        viewMode: this.viewMode,
      };
      this.savedViews.push({ id, name, state });
      this.activeViewId = id;
      await this.savePrefs();
    },
    async applyView(id: string) {
      const view = this.savedViews.find((v) => v.id === id);
      if (view) {
        const s = view.state as any;
        this.query = s.query ?? "";
        this.status = new Set((s.status || []) as SubStatus[]);
        this.freq = new Set((s.freq || []) as Frequency[]);
        this.tier = new Set((s.tier || []) as string[]);
        this.sort = s.sort as SortOption;
        this.visibleColumns = Array.isArray(s.visibleColumns)
          ? s.visibleColumns.slice()
          : [];
        this.density = s.density as "comfortable" | "compact";
        this.viewMode = s.viewMode as "table" | "card";
        statusStorage.value = Array.from(this.status);
        freqStorage.value = Array.from(this.freq);
        tierStorage.value = Array.from(this.tier);
        this.activeViewId = id;
        await this.savePrefs();
      }
    },
    async deleteView(id: string) {
      this.savedViews = this.savedViews.filter((v) => v.id !== id);
      if (this.activeViewId === id) {
        this.activeViewId = null;
      }
      await this.savePrefs();
    },
    async loadPrefs() {
      const views = await cashuDb.subscriberViews.toArray();
      this.savedViews = views.map((v) => ({
        id: v.id,
        name: v.name,
        state: v.state,
      }));
      const pref = await cashuDb.subscriberViewPrefs.get("prefs");
      this.activeViewId = pref?.activeViewId ?? null;
      if (this.activeViewId) {
        await this.applyView(this.activeViewId);
      }
    },
    async savePrefs() {
      await cashuDb.subscriberViews.clear();
      await cashuDb.subscriberViews.bulkAdd(this.savedViews);
      await cashuDb.subscriberViewPrefs.put({
        id: "prefs",
        activeViewId: this.activeViewId,
      });
    },
    exportCsv() {
      downloadCsv();
    },
  },
});
