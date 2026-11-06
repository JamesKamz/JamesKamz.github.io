"use client";

import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { FormState } from "@/lib/admin/actions";

export function InviteForm({ action }: { action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="card grid gap-4 p-6 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
      <div>
        <label htmlFor="inv-name" className="label">Nom du client (optionnel)</label>
        <input id="inv-name" name="name" className="input" placeholder="Awa Diallo" />
      </div>
      <div>
        <label htmlFor="inv-email" className="label">E-mail (optionnel)</label>
        <input id="inv-email" name="email" type="email" className="input" placeholder="awa@entreprise.com" />
      </div>
      <div>
        <label htmlFor="inv-project" className="label">Projet (optionnel)</label>
        <input id="inv-project" name="project" className="input" placeholder="Boutique en ligne" />
      </div>
      <div>
        <label htmlFor="inv-locale" className="label">Langue</label>
        <select id="inv-locale" name="locale" defaultValue="fr" className="input">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className={buttonClass("primary", "px-4 py-3")}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Link2 className="size-4" aria-hidden />} Créer le lien
      </button>
      {state.error ? <p role="alert" className="text-sm text-danger md:col-span-5">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-accent-2 md:col-span-5">{state.message}</p> : null}
    </form>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}
