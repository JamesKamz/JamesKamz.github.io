import { Eye, EyeOff, Plus, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { buttonClass } from "@/components/ui/Button";
import { deleteResource, toggleResource } from "@/lib/admin/actions";
import { getResource } from "@/lib/admin/resources";
import { getDb } from "@/lib/db";

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toLocaleDateString("fr-FR");
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default async function ResourceList({ params, searchParams }: PageProps<"/admin/[resource]">) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  const db = getDb();
  if (!db) return <NoDatabase />;
  const saved = (await searchParams).saved;
  const delegate = (db as unknown as Record<string, { findMany(a: unknown): Promise<Record<string, unknown>[]> }>)[resource.model]!;
  const rows = await delegate.findMany({ orderBy: resource.orderBy });
  const labelOf = (name: string) => resource.fields.find((f) => f.name === name)?.label ?? name;

  return (
    <>
      <PageHeader title={resource.title} description={resource.description}>
        <Link href={`/admin/${key}/new`} className={buttonClass("primary", "px-4 py-2.5")}>
          <Plus className="size-4" aria-hidden /> Ajouter
        </Link>
      </PageHeader>
      {saved ? <p role="status" className="mb-4 text-sm text-accent-2">Enregistré ✓ — le site public est à jour.</p> : null}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs text-muted">
              {resource.columns.map((c) => (
                <th key={c} className="px-4 py-3 font-normal">{labelOf(c)}</th>
              ))}
              {resource.toggles?.map((t) => (
                <th key={t} className="px-4 py-3 font-normal">{labelOf(t)}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const id = String(row.id);
              return (
                <tr key={id} className="hover:bg-surface-2">
                  {resource.columns.map((c, i) => (
                    <td key={c} className="max-w-xs truncate px-4 py-3">
                      {i === 0 ? (
                        <Link href={`/admin/${key}/${id}`} className="font-medium hover:text-accent">
                          {display(row[c])}
                          {row.isExample ? <span className="ml-2 rounded bg-danger/15 px-1.5 py-0.5 font-mono text-[10px] text-danger">EXEMPLE</span> : null}
                        </Link>
                      ) : (
                        <span className="text-fg-soft">{display(row[c])}</span>
                      )}
                    </td>
                  ))}
                  {resource.toggles?.map((t) => (
                    <td key={t} className="px-4 py-3">
                      <form action={toggleResource.bind(null, key, id, t)}>
                        <button type="submit" className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${row[t] ? "border-accent-2/50 text-accent-2" : "border-line text-muted"}`} aria-pressed={Boolean(row[t])}>
                          {t === "featured" ? <Star className="size-3" aria-hidden /> : row[t] ? <Eye className="size-3" aria-hidden /> : <EyeOff className="size-3" aria-hidden />}
                          {row[t] ? "Oui" : "Non"}
                        </button>
                      </form>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/${key}/${id}`} className="mr-4 text-sm text-accent hover:underline">Modifier</Link>
                    <ConfirmButton action={deleteResource.bind(null, key, id)}>Supprimer</ConfirmButton>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-muted">Aucun élément.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
