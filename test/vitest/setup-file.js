// This file will be run before each test file
import { createPinia, setActivePinia } from "pinia";

// Initialize Pinia globally at module load time
console.log("Vitest setup file is running");
setActivePinia(createPinia()); // Runs immediately, before imports

// Still keep beforeEach to reset Pinia state between tests
import { beforeEach } from "vitest";
beforeEach(() => {
  console.log("Setting up Pinia");
  setActivePinia(createPinia()); // Fresh instance for each test
});
