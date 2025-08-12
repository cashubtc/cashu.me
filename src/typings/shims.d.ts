// Quasar/Vite env
/// <reference types="vite/client" />
/// <reference types="quasar" />

// JS modules used from TS
declare module "src/boot/i18n" {
  export const i18n: any;
}
declare module "src/js/utils" {
  export function currentDateStr(): string;
}
declare module "src/router" {
  const router: any;
  export default router;
}

// Web NFC in some browsers
declare global {
  interface Window {
    NDEFReader?: any;
  }
}
export {};
