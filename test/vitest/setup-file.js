import 'happy-dom'
import 'fake-indexeddb/auto'
import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}))

beforeEach(() => {
  setActivePinia(createPinia())
})
