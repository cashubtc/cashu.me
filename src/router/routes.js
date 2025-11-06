const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/WalletPage.vue") },
    ],
  },
  {
    path: "/settings",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/Settings.vue") }],
  },
  {
    path: "/mintdetails",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/MintDetailsPage.vue") },
    ],
  },
  {
    path: "/discoverMints",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/MintDiscoveryPage.vue") },
    ],
  },
  {
    path: "/mintratings",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/MintRatingsPage.vue") },
    ],
  },
  {
    path: "/createreview",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/CreateMintReviewPage.vue"),
      },
    ],
  },
  {
    path: "/restore",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/Restore.vue") }],
  },
  {
    path: "/already-running",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/AlreadyRunning.vue") },
    ],
  },
  {
    path: "/welcome",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/WelcomePage.vue") },
    ],
  },
  {
    path: "/terms",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/TermsPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:pathMatch(.*)*",
    component: () => import("src/pages/ErrorNotFound.vue"),
  },
];

export default routes;
