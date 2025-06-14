// This file will be run before each test file
import { beforeEach } from 'vitest'
import { createTestingPinia } from 'pinia'

beforeEach(() => {
  createTestingPinia({ stubActions: false })
})
