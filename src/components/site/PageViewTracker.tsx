"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Cookie-free page-view beacon; the external referrer is only sent with the landing page. */
export function PageViewTracker() {
  const pathname = usePathname();
  // Last path sent: also stops the double effect run of React Strict Mode in dev.
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === pathname) return;
    const body = JSON.stringify({ path: pathname, referrer: sent.current === null ? document.referrer || undefined : undefined });
    sent.current = pathname;
    if (!navigator.sendBeacon?.("/api/track", body)) {
      void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
