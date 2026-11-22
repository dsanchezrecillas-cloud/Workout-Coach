// Smart Gains service worker — makes the app start without internet.
// Strategy: network first (so updates arrive immediately), cache as fallback.
const CACHE='smart-gains-v1';
const CORE=['./','index.html','icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;                       // AI calls (POST) always go to the network
  const url=new URL(req.url);
  const sameOrigin=url.origin===self.location.origin;
  const fonts=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!sameOrigin&&!fonts)return;
  if(sameOrigin&&url.pathname.startsWith('/.netlify/'))return; // proxy/functions: never cache
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(r=>r||(req.mode==='navigate'?caches.match('index.html'):undefined)))
  );
});
