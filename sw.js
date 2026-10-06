// roybase service worker — 网络优先：改了样式/脚本立即生效，离线才回退缓存
const CACHE_NAME = 'roybase-v3';
const PRECACHE_URLS = [
  '/',
  '/css/style.css?v=12',
  '/js/main.js?v=12',
  '/data/status.json',
  '/data/stats.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const put = (req, res) => caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 运行时数据：先给缓存（离线也能看到状态），再后台刷新
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fresh = fetch(req)
          .then(res => { if (res && res.status === 200) put(req, res); return res; })
          .catch(() => cached);
        return cached || fresh;
      })
    );
    return;
  }

  // 页面与静态资源：网络优先，失败才用缓存（旧缓存不会压住新改动）
  event.respondWith(
    fetch(req)
      .then(res => { if (res && res.status === 200) put(req, res); return res; })
      .catch(() => caches.match(req).then(c => c || caches.match('/')))
  );
});
