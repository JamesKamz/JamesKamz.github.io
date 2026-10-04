import type { Metadata } from "next";
import { ThemeScript } from "@/components/site/ThemeScript";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin James Kamz" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-bg text-fg">{children}</body>
    </html>
  );
}
