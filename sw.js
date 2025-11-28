self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a simple offline response or index.html if offline
      // This is crucial for the 'add to homescreen' to work reliably
      return caches.match(event.request).then(response => {
         return response || new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

// Handle notification clicks (System Panel interactions)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Focus the open window if available
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});