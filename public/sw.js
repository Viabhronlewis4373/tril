const CACHE_NAME = 'stealth-map-cache-v1';

let isNetworkEnabled = true;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_NETWORK_STATUS') {
    isNetworkEnabled = event.data.enabled;
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept map tiles (ArcGIS, Carto, etc.)
  const isMapTile = url.href.includes('arcgisonline.com') || url.href.includes('cartocdn.com');

  if (isMapTile) {
    if (!isNetworkEnabled) {
      // If network is killed, strictly return from IndexedDB
      // For simplicity in SW, we return a custom response or fail
      // However, reading from IndexedDB directly in SW is complex without idb library injected.
      // So if network is killed, we fail the fetch, and MapLibre's transformRequest or SW handles it.
      // Actually, we can just reject the fetch if network is killed.
      event.respondWith(new Response(null, { status: 503, statusText: 'Service Unavailable (Internet Kill Switch Active)' }));
      return;
    }
  }
  
  // Pass through all other requests normally
  return;
});
