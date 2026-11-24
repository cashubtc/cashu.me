import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { walletDataReady } from "src/stores/bootstrap";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Persisted wallet data lives partly in IndexedDB, which loads
  // asynchronously. Wait for it before any page renders.
  // On failure the user is notified and the page still renders (so the app is
  // not blank); the wallet page does not start its workers in that case.
  Router.beforeEach(async () => {
    try {
      await walletDataReady();
    } catch {
      // reported by walletDataReady; retried on the next navigation
    }
  });

  return Router;
});
