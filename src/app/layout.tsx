import type { ReactNode } from "react";
import "./globals.css";

// The <html> element is rendered by the nested root layouts:
// `app/[locale]/layout.tsx` (public site) and `app/admin/layout.tsx` (dashboard).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
