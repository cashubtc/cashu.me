import "fake-indexeddb/auto";

vi.mock("quasar", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    QIcon: actual.QIcon || { name: "QIcon", template: "<i />" },
    Notify: { create: vi.fn() },
  };
});

import { setActivePinia, createPinia } from "pinia";
setActivePinia(createPinia());

import { beforeAll } from "vitest";
import { Quasar, Dialog } from "quasar";
import { createI18n } from "vue-i18n";
import { config } from "@vue/test-utils";

config.global.plugins = [
  [Quasar, { plugins: { Dialog } }],
  createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: { BucketManager: { helper: { intro: "" }, actions: { edit: "" } } },
    },
  }),
];
config.global.stubs = {
  "router-link": { template: "<a><slot/></a>" },
  InfoTooltip: true,
};
