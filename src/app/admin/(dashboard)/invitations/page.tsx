import { headers } from "next/headers";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CopyButton, InviteForm } from "@/components/admin/InviteForm";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { getPathname } from "@/i18n/navigation";
import { createInvite, deleteInvite } from "@/lib/admin/actions";
import { getDb } from "@/lib/db";
import type { Locale } from "@/lib/types";
import { cn, SITE_URL } from "@/lib/utils";

export const metadata = { title: "Invitations témoignages" };

const MESSAGE: Record<string, (link: string) => string> = {
  fr: (link) => `Bonjour, merci encore pour notre collaboration ! Accepteriez-vous de laisser un court témoignage sur votre expérience ? Cela prend 2 minutes : ${link}`,
  en: (link) => `Hi, thanks again for working together! Would you mind leaving a short testimonial about your experience? It takes 2 minutes: ${link}`,
  ar: (link) => `مرحبًا، شكرًا مرة أخرى على تعاوننا! هل تمانع في ترك شهادة قصيرة عن تجربتك؟ لن يستغرق ذلك أكثر من دقيقتين: ${link}`,
};

export default async function InvitationsPage() {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const invites = await db.testimonialInvite.findMany({ orderBy: { createdAt: "desc" } });
  // Links point to the host the admin is using (localhost in dev, the real domain in production).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : SITE_URL;
  const now = new Date();

  return (
    <>
      <Link href="/admin/testimonials" className="font-mono text-xs text-muted hover:text-accent">← Témoignages</Link>
      <PageHeader
        title="Inviter un client à témoigner"
        description="Créez un lien personnel et envoyez-le à un client. Il remplit son témoignage lui-même ; vous le relisez puis le publiez depuis Témoignages. Un lien ne sert qu'une fois et expire au bout de 30 jours."
      />
      <InviteForm action={createInvite} />

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs text-muted">
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Projet</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Envoyer le lien</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invites.map((inv) => {
              const link = origin + getPathname({ locale: inv.locale as Locale, href: { pathname: "/review/[token]", params: { token: inv.token } } });
              const text = (MESSAGE[inv.locale] ?? MESSAGE.fr!)(link);
              const status = inv.usedAt ? "used" : inv.expiresAt < now ? "expired" : "pending";
              return (
                <tr key={inv.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.name ?? "—"}</p>
                    <p className="text-xs text-muted">{[inv.email, inv.locale.toUpperCase()].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-fg-soft">{inv.project ?? "—"}</td>
                  <td className="px-4 py-3">
                    {status === "used" && inv.testimonialId ? (
                      <Link href={`/admin/testimonials?edit=${inv.testimonialId}`} className="rounded-full border border-accent-2/50 px-2.5 py-1 text-xs text-accent-2 hover:bg-accent-2/10">
                        Reçu · relire et publier
                      </Link>
                    ) : (
                      <span className={cn("rounded-full border px-2.5 py-1 text-xs", status === "expired" ? "border-danger/40 text-danger" : "border-line text-muted")}>
                        {status === "expired" ? "Expiré" : status === "used" ? "Reçu" : `En attente · expire le ${inv.expiresAt.toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {status === "pending" ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <CopyButton text={link} />
                        {inv.email ? (
                          <a href={`mailto:${inv.email}?subject=${encodeURIComponent("Votre témoignage")}&body=${encodeURIComponent(text)}`} className="text-sm text-accent hover:underline">
                            E-mail
                          </a>
                        ) : null}
                        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                          WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmButton action={deleteInvite.bind(null, inv.id)} message="Supprimer cette invitation ?">Supprimer</ConfirmButton>
                  </td>
                </tr>
              );
            })}
            {!invites.length ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Aucune invitation pour l&apos;instant.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
