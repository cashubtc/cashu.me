import { setActivePinia, createPinia } from 'pinia';
import { beforeAll } from 'vitest';
import { Quasar, Dialog } from 'quasar';
import { createI18n } from 'vue-i18n';
import { config } from '@vue/test-utils';

beforeAll(() => setActivePinia(createPinia()));
config.global.plugins = [
  [Quasar, { plugins: { Dialog } }],
  createI18n({ legacy: false, locale: 'en', messages: { en: {} } }),
];
config.global.stubs = { 'router-link': { template: '<a><slot/></a>' }, InfoTooltip: true };
