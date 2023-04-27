// ~~/src/router/index.js

import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";

/**
 * `import.meta.env.PROD`: {boolean} whether the app is running in production.
 * @see https://vitejs.dev/guide/env-and-mode.html#env-variables
 */
const createHistory = import.meta.env.PROD
  ? createMemoryHistory
  : import.meta.env.VUE_ROUTER_MODE === "history" // either "history" or "hash"
  ? createWebHistory
  : createWebHashHistory;

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,

  history: createHistory(
    /**
     * `import.meta.env.SSR`: {boolean} whether the app is running in the server.
     * @see https://vitejs.dev/guide/env-and-mode.html#env-variables
     */
    import.meta.env.SSR ? void 0 : import.meta.env.VUE_ROUTER_BASE || "/"
  ),
});

export default router;
