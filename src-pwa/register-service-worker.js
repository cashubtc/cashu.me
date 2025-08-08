import { register } from 'register-service-worker'

// Vite-compatible: 'import.meta.env.PROD' instead of process.env.NODE_ENV === 'production'
if (import.meta.env.PROD) {
  register('/sw.js', {
    ready() {
      console.log('[PWA] App is being served from cache by a service worker.')
    },
    registered() {
      console.log('[PWA] Service worker has been registered.')
    },
    cached() {
      console.log('[PWA] Content has been cached for offline use.')
    },
    updatefound() {
      console.log('[PWA] New content is downloading.')
    },
    updated(registration) {
      console.log('[PWA] New content is available; refreshing...')
      // Simple strategy: refresh when a new SW takes control
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      window.location.reload()
    },
    offline() {
      console.log('[PWA] No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('[PWA] Error during service worker registration:', error)
    }
  })
}
