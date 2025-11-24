// Service Worker for next-banana PWA
const CACHE_NAME = 'next-banana-v1';
const OFFLINE_URL = '/offline';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/icon-192.png',
    '/icon-512.png',
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // 立即激活新的 service worker
    self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // 立即控制所有页面
    self.clients.claim();
});

// Fetch 事件 - 网络优先，失败时使用缓存
self.addEventListener('fetch', (event) => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }

    // 跳过 Chrome 扩展和非 HTTP(S) 请求
    if (
        !event.request.url.startsWith('http') ||
        event.request.url.includes('chrome-extension')
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 如果请求成功，克隆响应并缓存
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络请求失败，尝试从缓存获取
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // 如果是导航请求（页面），返回离线页面
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }

                    // 其他请求返回基本响应
                    return new Response('Network error', {
                        status: 408,
                        headers: { 'Content-Type': 'text/plain' },
                    });
                });
            })
    );
});
