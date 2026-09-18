// Artxus Service Worker — Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Artxus', body: event.data.text() };
  }

  const options = {
    body: data.body || 'Nueva actividad en Artxus',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Ver ahora' },
      { action: 'dismiss', title: 'Ignorar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Artxus', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find(c => c.url.includes(url) && 'focus' in c);
      if (existingClient) return existingClient.focus();
      return self.clients.openWindow(url);
    })
  );
});
