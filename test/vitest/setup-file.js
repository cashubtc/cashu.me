// This file will be run before each test file
import { createPinia, setActivePinia } from "pinia";
import "fake-indexeddb/auto";

// Initialize Pinia globally at module load time
console.log("Vitest setup file is running");
setActivePinia(createPinia()); // Runs immediately, before imports

// Still keep beforeEach to reset Pinia state between tests
import { beforeEach } from "vitest";
beforeEach(() => {
  console.log("Setting up Pinia");
  setActivePinia(createPinia()); // Fresh instance for each test
});

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
