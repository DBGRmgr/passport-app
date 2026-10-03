const CACHE="passport-v3";
const SHELL=["./","index.html","manifest.webmanifest","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.hostname.endsWith("google.com")||u.hostname.endsWith("googleusercontent.com"))return;
  const same=u.origin===self.location.origin;
  const store=res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res};
  if(same){ // 앱 파일: 인터넷이 되면 항상 최신, 안 되면 저장본
    e.respondWith(fetch(r).then(store).catch(()=>caches.match(r).then(h=>h||caches.match("index.html"))));
  }else{ // OCR 엔진 등 외부 파일: 저장본 우선
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(store)));
  }
});
