"use client";

import dynamic from "next/dynamic";

// Decorative only: load after hydration, never on the critical path.
export const LazyCursor = dynamic(() => import("./Cursor").then((m) => m.Cursor), { ssr: false });
