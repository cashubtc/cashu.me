const routes = [
  {
    path: "/wallet",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/WalletPage.vue") },
    ],
  },
  {
    path: "/",
    redirect: "/wallet",
  },
  {
    path: "/settings",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/Settings.vue") }],
  },
  {
    path: "/find-creators",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/FindCreators.vue") },
    ],
  },
  {
    path: "/creator/login",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/CreatorLoginPage.vue") },
    ],
  },
  {
    path: "/creator/dashboard",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/CreatorDashboardPage.vue"),
      },
    ],
  },
  {
    path: "/creators/:npubOrVanityName",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/PublicCreatorProfilePage.vue"),
      },
    ],
  },
  {
    path: "/buckets",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/Buckets.vue") }],
  },
  {
    path: "/move-proofs",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/MoveProofs.vue") },
    ],
  },
  {
    path: "/chats",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/Chats.vue") }],
  },
  {
    path: "/chats/:pubkey",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/ChatView.vue") }],
  },
  {
    path: "/buckets/:id",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/BucketDetail.vue") },
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
  {
    path: "/about",
    component: () => import("layouts/FullscreenLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/AboutPage.vue") },
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
