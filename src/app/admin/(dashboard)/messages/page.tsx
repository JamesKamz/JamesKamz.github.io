import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteMessage, messageToLead, toggleMessageHandled } from "@/lib/admin/actions";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const sp = await searchParams;
  const filter = sp.filter === "all" ? "all" : sp.filter === "handled" ? "handled" : "open";
  const messages = await db.contactMessage.findMany({
    where: filter === "all" ? {} : { handled: filter === "handled" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const tabs = [
    { key: "open", label: "Non traités" },
    { key: "handled", label: "Traités" },
    { key: "all", label: "Tous" },
  ];
  return (
    <>
      <PageHeader title="Messages de contact" />
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <a key={t.key} href={`?filter=${t.key}`} className={cn("rounded-full border px-3 py-1.5 text-sm", filter === t.key ? "border-accent text-accent" : "border-line text-fg-soft")}>
            {t.label}
          </a>
        ))}
      </div>
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} id={m.id} className={cn("card p-6", m.handled && "opacity-70")}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="font-medium">{m.subject}</p>
                <p className="text-sm text-muted">
                  {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="text-accent hover:underline">{m.email}</a>
                  {m.phone ? ` · ${m.phone}` : ""} · {m.createdAt.toLocaleString("fr-FR")} · {m.locale.toUpperCase()}
                </p>
              </div>
              {m.budget ? <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs">Budget : {m.budget}</span> : null}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-fg-soft">{m.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-sm">
              <form action={toggleMessageHandled.bind(null, m.id)}>
                <button type="submit" className="text-accent hover:underline">{m.handled ? "Marquer non traité" : "Marquer traité"}</button>
              </form>
              <form action={messageToLead.bind(null, m.id)}>
                <button type="submit" className="text-fg-soft hover:text-accent hover:underline">Convertir en lead</button>
              </form>
              <ConfirmButton action={deleteMessage.bind(null, m.id)} className="ml-auto">Supprimer</ConfirmButton>
            </div>
          </li>
        ))}
        {!messages.length ? <li className="card p-8 text-center text-muted">Aucun message.</li> : null}
      </ul>
    </>
  );
}
