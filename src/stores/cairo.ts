import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

type CairoReceiveData = {
  executable: string;
  programInput: any[]; // Using any[] instead of bigint[] for compatibility with current TypeScript config
  lockedToken: string;
};

export const useCairoStore = defineStore("cairo", {
  state: () => ({
    cairoReceiveData: {
      executable: "",
      programInput: [] as any[],
      lockedToken: "",
    } as CairoReceiveData,
    showCairoDialog: false,
  }),
  actions: {
    setCairoReceiveData(
      executable: string,
      programInput: any[],
      lockedToken: string = ""
    ) {
      this.cairoReceiveData.executable = executable;
      this.cairoReceiveData.programInput = programInput;
      this.cairoReceiveData.lockedToken = lockedToken;
    },
    clearCairoReceiveData() {
      this.cairoReceiveData.executable = "";
      this.cairoReceiveData.programInput = [];
      this.cairoReceiveData.lockedToken = "";
    },
    showCairoReceiveDialog() {
      this.showCairoDialog = true;
    },
    hideCairoReceiveDialog() {
      this.showCairoDialog = false;
    },
  },
});
