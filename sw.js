const STATIC_FRONTEND=true;
const CACHE='virtuous-shell-1791161491132';
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const assets=STATIC_FRONTEND?await fetch('/shell-assets.json').then(r=>r.json()):['/offline.html','/icons/ribbon-v.png'];
 await cache.addAll(assets);
 await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Only the public Pages shell is cached. Keys/private content stay in IndexedDB;
// server API responses and authenticated server pages are never cached here.
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(STATIC_FRONTEND&&url.origin===self.location.origin&&event.request.method==='GET'&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/icons/')||url.pathname.startsWith('/films/'))){
  event.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match(event.request);if(saved)return saved;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}));return;
 }
 if(url.origin===self.location.origin&&url.pathname==='/icons/ribbon-v.png'){
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  return;
 }
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match(STATIC_FRONTEND?'/':'/offline.html')));
});
self.addEventListener('push',event=>{let data={title:'Virtuous',body:'Your daily reflection is ready.',url:'/?view=reflection',tag:'wife-daily'};try{Object.assign(data,event.data.json());}catch{}event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/icons/ribbon-v.png',badge:'/icons/ribbon-v.png',tag:data.tag,data:{url:data.url}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=new URL(event.notification.data?.url||'/',self.location.origin);if(url.origin!==self.location.origin)return;event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{for(const client of clients){if('focus'in client){await client.navigate(url.href);return client.focus();}}return self.clients.openWindow(url.href);}));});
