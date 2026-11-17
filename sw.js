// İsim Zinciri: önce internetten yeni sürümü al, internet yoksa kayıtlı sürümü aç
const C = 'isim-zinciri-v166', WPC = 'iz-duvar-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'].map(u => new Request(u, { cache:'reload' }))))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // Duvar kağıdı fotoğrafları: bir kez indir, sonra telefondan aç (internetsiz de görünür)
  if (u.hostname === 'images.unsplash.com'){
    e.respondWith(caches.open(WPC).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  // Tarayıcının 10 dakikalık önbelleğini atla: her açılışta sunucudaki en yeni sürüm gelsin (değişmediyse sunucu hızlıca "aynı" der)
  const fresh = e.request.mode === 'navigate' || /\/(index\.html)?$|\.(js|json)$/.test(u.pathname) ? fetch(u.href, { cache:'no-cache', credentials:'same-origin' }) : fetch(e.request);
  e.respondWith(fresh.then(r => { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});

// Bildirimler: davet, arkadaşlık isteği, geri bildirim (kilit ekranında ve bildirim panelinde görünür)
self.addEventListener('push', e => {
  let d = {};
  try { const j = e.data ? e.data.json() : {}; d = j.data || j; } catch(_){}
  if (!d.title) return;
  // Uygulama şu an ekranda açıksa (davet zaten uygulamanın içinde görünür) çift bildirim gösterme
  const show = () => self.registration.showNotification(d.title, {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || d.type, renotify: true,
    requireInteraction: d.type === 'invite', vibrate: [200, 100, 200], data: { url: d.url || './' },
    actions: d.a1 ? [{ action:'go', title:d.a1 }, { action:'no', title:d.a2 || '✕' }] : [] });
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const vis = list.some(c => c.visibilityState === 'visible' && c.url.startsWith(self.registration.scope));
    if (vis && d.type !== 'test') return;
    return show();
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'no') return;
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list){ if (c.url.startsWith(self.registration.scope)){ c.postMessage({ iz:'nav', url }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
