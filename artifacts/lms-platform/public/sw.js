const CACHE_NAME = "lms-pwa-v4";

self.addEventListener("push", (event) => {
  let data = { title: "LMS Platform", body: "لديك إشعار جديد" };
  try { data = { ...data, ...event.data?.json() }; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      dir: "auto",
      tag: data.tag ?? "lms-notification",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((all) => {
        for (const client of all) {
          if ("focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/@")) return;
  if (url.pathname.startsWith("/src/")) return;
  if (url.pathname.startsWith("/node_modules/")) return;

  if (request.destination === "document") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() =>
        caches.match("/offline.html").then(
          (cached) => cached ?? new Response("<h1>أنت غير متصل بالإنترنت</h1>", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (
            response.ok &&
            (request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "image" ||
              request.destination === "font")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match(request))
    )
  );
});