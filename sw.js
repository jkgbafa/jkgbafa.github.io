const CACHE='virtuous-shell-v4';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/offline.html','/icons/ribbon-v.png'])));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Private API data and authenticated pages are deliberately never cached here.
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin===self.location.origin&&url.pathname==='/icons/ribbon-v.png'){
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  return;
 }
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));
});
self.addEventListener('push',event=>{let data={title:'Virtuous',body:'Your daily reflection is ready.',url:'/?view=reflection',tag:'wife-daily'};try{Object.assign(data,event.data.json());}catch{}event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/icons/ribbon-v.png',badge:'/icons/ribbon-v.png',tag:data.tag,data:{url:data.url}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=new URL(event.notification.data?.url||'/',self.location.origin);if(url.origin!==self.location.origin)return;event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{for(const client of clients){if('focus'in client){await client.navigate(url.href);return client.focus();}}return self.clients.openWindow(url.href);}));});
