const CACHE_NAME = 'co2app-cache-v20';
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./offline.html",
  "./manifest.webmanifest",
  "./service-worker.js",
  "./js/common.js",
  "./js/quiz.js",
  "./js/footprint.js",
  "./js/dashboard.js",
  "./js/settings.js",
  "./config.json",
  "./pages/settings.html",
  "./pages/quiz.html",
  "./pages/footprint.html",
  "./pages/dashboard.html",
  "./pages/info.html",
  "./pages/install.html",
  "./assets/logo.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/questions/quiz2.json",
  "./assets/footprintModel.json",
  "./js/menu.js",
  "./assets/vendor/echarts.min.js",
  "./assets/footprintModel_final_draft.json",
  "./pages/about.html",
  "./assets/ui/homeN.png",
  "./assets/ui/busN.png",
  "./assets/ui/bookN.png",
  "./assets/ui/FoodLifestyleN.png",
  "./assets/info/Info_gr.html",
  "./assets/info/InfoEn.html",
  "./assets/fonts/Comfortaa-SemiBold.ttf",
  "./assets/fonts/Comfortaa-Bold.ttf"
,
  "./assets/ui/co2N.png",
  "./assets/ui/quizN.png",
  "./assets/ui/infoN.png",
  "./assets/ui/settingsN.png",
  "./assets/ui/lang_en.png",
  "./assets/ui/lang_el.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // navigation: fallback to offline page
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        // cache new GET static assets
        if (req.method === "GET" && resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return resp;
      });
    })
  );
});