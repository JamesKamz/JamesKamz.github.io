import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { saveSettings } from "@/lib/admin/actions";
import { settingsFields } from "@/lib/admin/resources";
import { getDb } from "@/lib/db";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) return <p className="text-muted">Lancez le seed pour initialiser les paramètres.</p>;
  return (
    <>
      <PageHeader title="Paramètres du site" description="Identité, liens, CV et chatbot. Les changements sont visibles immédiatement, sans redéploiement." />
      <ResourceForm action={saveSettings} fields={settingsFields} values={settings} />
    </>
  );
}
