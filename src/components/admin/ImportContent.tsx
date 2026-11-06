"use client";

import { DatabaseZap, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { buttonClass } from "@/components/ui/Button";
import { ConfirmButton } from "./ConfirmButton";

/** Fills the database from the content files shipped with the site (first deploy, or reset). */
export function ImportContent({ importMissing, resetAll, status }: { importMissing: () => Promise<void>; resetAll: () => Promise<void>; status?: string }) {
  const [pending, start] = useTransition();
  return (
    <section className="card mb-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="flex items-center gap-2 font-medium">
            <DatabaseZap className="size-4 text-accent" aria-hidden /> Contenu du site
          </h2>
          <p className="mt-1 text-sm text-muted">
            Crée en un clic les projets, services, compétences, parcours, FAQ, chiffres clés et paramètres à partir des fichiers du site.
            Idéal après la mise en ligne, sur une base vide. Vos leads, messages, témoignages reçus et statistiques ne sont jamais touchés.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <button type="button" disabled={pending} onClick={() => start(() => importMissing())} className={buttonClass("primary", "px-4 py-2.5")}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <DatabaseZap className="size-4" aria-hidden />} Importer le contenu manquant
          </button>
          <ConfirmButton action={resetAll} message="Remplacer tout le contenu par celui des fichiers ? Vos modifications faites dans l'admin seront perdues.">
            Tout réinitialiser
          </ConfirmButton>
        </div>
      </div>
      {status ? <p role="status" className="mt-4 text-sm text-accent-2">{status}</p> : null}
    </section>
  );
}
