/**
 * Registers the minimal service worker (`public/sw.js`). It only shows and
 * handles reminder notifications; there is no push and no caching yet.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
