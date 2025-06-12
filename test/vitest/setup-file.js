import 'happy-dom'
import 'fake-indexeddb/auto'
import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}))

// polyfill navigator.permissions for camera checks
if (typeof navigator !== 'undefined') {
  if (!navigator.permissions) navigator.permissions = {};
  if (!navigator.permissions.query) {
    navigator.permissions.query = async ({ name }) => {
      if (name === 'camera') return { state: 'granted' };
      return { state: 'prompt' };
    };
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
})
