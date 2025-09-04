import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

type CairoReceiveData = {
  executable: string;
  programInput: any[]; // Using any[] instead of bigint[] for compatibility with current TypeScript config
};

export const useCairoStore = defineStore("cairo", {
  state: () => ({
    cairoReceiveData: {
      executable: "",
      programInput: [] as any[],
    } as CairoReceiveData,
    showCairoDialog: false,
  }),
  actions: {
    setCairoReceiveData(executable: string, programInput: any[]) {
      this.cairoReceiveData.executable = executable;
      this.cairoReceiveData.programInput = programInput;
    },
    clearCairoReceiveData() {
      this.cairoReceiveData.executable = "";
      this.cairoReceiveData.programInput = [];
    },
    showCairoReceiveDialog() {
      this.showCairoDialog = true;
    },
    hideCairoReceiveDialog() {
      this.showCairoDialog = false;
    },
  },
});
