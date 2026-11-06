import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Élément introuvable</h1>
        <Link href="/admin" className="mt-6 inline-block text-accent underline">Retour au dashboard</Link>
      </div>
    </div>
  );
}
