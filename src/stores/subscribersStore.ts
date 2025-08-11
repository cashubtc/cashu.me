import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { cashuDb } from "./dexie";
import downloadCsv from "../utils/subscriberCsv";
import type { SubStatus, Frequency } from "../types/subscriber";

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
    visibleColumns: useLocalStorage<string[]>(
      "subscribers.visibleColumns",
      []
    ),
    density: useLocalStorage<"comfortable" | "compact">(
      "subscribers.density",
      "comfortable"
    ),
    viewMode: useLocalStorage<"table" | "card">(
      "subscribers.viewMode",
      "table"
    ),
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
    async saveView(name: string) {
      await cashuDb.subscriberViews.put({
        name,
        query: this.query,
        status: Array.from(this.status),
        freq: Array.from(this.freq),
        tier: Array.from(this.tier),
        sort: this.sort,
        visibleColumns: this.visibleColumns.slice(),
        density: this.density,
        viewMode: this.viewMode,
      });
    },
    async loadView(name: string) {
      const view = await cashuDb.subscriberViews.get(name);
      if (view) {
        this.query = view.query;
        this.status = new Set(view.status as SubStatus[]);
        this.freq = new Set(view.freq as Frequency[]);
        this.tier = new Set(view.tier);
        this.sort = view.sort as SortOption;
        this.visibleColumns = view.visibleColumns.slice();
        this.density = view.density as "comfortable" | "compact";
        this.viewMode = view.viewMode as "table" | "card";
        statusStorage.value = view.status;
        freqStorage.value = view.freq;
        tierStorage.value = view.tier;
      }
    },
    exportCsv() {
      downloadCsv();
    },
  },
});
