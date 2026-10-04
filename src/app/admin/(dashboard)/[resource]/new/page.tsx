import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { saveResource } from "@/lib/admin/actions";
import { getResource } from "@/lib/admin/resources";

export default async function NewResource({ params }: PageProps<"/admin/[resource]/new">) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  const defaults: Record<string, unknown> = { published: resource.key !== "testimonials", visible: true, order: 0, rating: 5 };
  return (
    <>
      <Link href={`/admin/${key}`} className="font-mono text-xs text-muted hover:text-accent">← {resource.title}</Link>
      <PageHeader title={`Nouveau ${resource.singular}`} />
      <ResourceForm action={saveResource.bind(null, key, null)} fields={resource.fields} values={defaults} />
    </>
  );
}
