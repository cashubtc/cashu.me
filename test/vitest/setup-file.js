<<<<<<< HEAD
// This file will be run before each test file
import { beforeEach } from "vitest";
import { createTestingPinia } from "pinia";

beforeEach(() => {
  createTestingPinia({ stubActions: false });
});
=======
import 'fake-indexeddb/auto'
import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}))

beforeEach(() => {
  setActivePinia(createPinia())
})
>>>>>>> dd213aba (Add bucket and proof management tests)
