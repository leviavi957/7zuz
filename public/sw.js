/* Minimal service worker: it only shows and handles reminder notifications. No push, no caching. */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Clicking a notification (or its "start workout" button) opens the target page:
// an open app window is focused and told where to go, otherwise a new one is opened there.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows[0]
      if (!open) return self.clients.openWindow(url)
      open.postMessage({ type: 'open-url', url })
      return open.focus()
    }),
  )
})