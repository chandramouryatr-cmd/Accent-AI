"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (/sw.js) on the client once the window has
 * loaded. Installs the PWA app shell so the app is installable and works
 * offline after first visit. No-op in environments without serviceWorker
 * support (e.g. SSR, older browsers).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => {
          // Registered successfully — app is now installable & offline-capable.
        })
        .catch(() => {
          // Registration failed — app still works online, just not installable.
        });
    };

    // Defer registration until after load to avoid competing with first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
