import Link from "next/link";
import { notFound } from "next/navigation";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { saveResource } from "@/lib/admin/actions";
import { getResource } from "@/lib/admin/resources";
import { getDb } from "@/lib/db";

export default async function EditResource({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  const db = getDb();
  if (!db) return <NoDatabase />;
  const delegate = (db as unknown as Record<string, { findUnique(a: unknown): Promise<Record<string, unknown> | null> }>)[resource.model]!;
  const row = await delegate.findUnique({ where: { id } });
  if (!row) notFound();
  const label = String(row[resource.columns[0]!] ?? id);
  return (
    <>
      <Link href={`/admin/${key}`} className="font-mono text-xs text-muted hover:text-accent">← {resource.title}</Link>
      <PageHeader title={label} description={row.isExample ? "⚠ Exemple fictif : remplacez-le par un vrai avis avant de le publier." : undefined} />
      <ResourceForm action={saveResource.bind(null, key, id)} fields={resource.fields} values={row} />
    </>
  );
}
