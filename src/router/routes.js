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
    children: [
      {
        path: "",
        component: () => import("src/pages/settings/SettingsPage.vue"),
      },
      {
        path: "backup",
        component: () => import("src/pages/settings/BackupRestoreSettings.vue"),
      },
      {
        path: "lightning-address",
        component: () =>
          import("src/pages/settings/LightningAddressSettings.vue"),
      },
      {
        path: "nostr",
        component: () => import("src/pages/settings/NostrSettings.vue"),
      },
      {
        path: "payment-requests",
        component: () =>
          import("src/pages/settings/PaymentRequestsSettings.vue"),
      },
      {
        path: "nwc",
        component: () => import("src/pages/settings/NwcSettings.vue"),
      },
      {
        path: "hardware",
        component: () => import("src/pages/settings/HardwareSettings.vue"),
      },
      {
        path: "p2pk",
        component: () => import("src/pages/settings/P2PKSettings.vue"),
      },
      {
        path: "privacy",
        component: () => import("src/pages/settings/PrivacySettings.vue"),
      },
      {
        path: "experimental",
        component: () => import("src/pages/settings/ExperimentalSettings.vue"),
      },
      {
        path: "appearance",
        component: () => import("src/pages/settings/AppearanceSettings.vue"),
      },
      {
        path: "language",
        component: () => import("src/pages/settings/LanguageSettings.vue"),
      },
      {
        path: "advanced",
        component: () => import("src/pages/settings/AdvancedSettings.vue"),
      },
    ],
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
