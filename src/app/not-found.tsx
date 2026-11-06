import Link from "next/link";
import { fontVariables } from "@/lib/fonts";

// Fallback for requests outside the locale segment (e.g. unmatched /admin paths).
export default function GlobalNotFound() {
  return (
    <html lang="fr" data-theme="dark" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center bg-bg p-6 text-fg">
        <div className="text-center">
          <p className="font-mono text-sm text-muted">404</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Page introuvable</h1>
          <Link href="/" className="mt-6 inline-block text-accent underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
