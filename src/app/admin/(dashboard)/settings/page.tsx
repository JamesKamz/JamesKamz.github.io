import { ImportContent } from "@/components/admin/ImportContent";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { importContent, saveSettings } from "@/lib/admin/actions";
import { settingsFields } from "@/lib/admin/resources";
import { getDb } from "@/lib/db";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const [settings, sp] = await Promise.all([db.siteSettings.findUnique({ where: { id: "main" } }), searchParams]);
  const status = typeof sp.imported === "string" ? sp.imported.slice(0, 300) : undefined;
  const importer = <ImportContent importMissing={importContent.bind(null, false)} resetAll={importContent.bind(null, true)} status={status} />;
  return (
    <>
      <PageHeader title="Paramètres du site" description="Identité, liens, CV et chatbot. Les changements sont visibles immédiatement, sans redéploiement." />
      {importer}
      {/* A fresh database has no settings row yet: the import above creates it. */}
      {settings ? <ResourceForm action={saveSettings} fields={settingsFields} values={settings} /> : <p className="text-muted">Base vide : cliquez sur « Importer le contenu manquant » pour créer les paramètres et tout le contenu.</p>}
    </>
  );
}
