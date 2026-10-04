import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { PricingEditor } from "@/components/admin/PricingEditor";
import { savePricing } from "@/lib/admin/actions";
import { parsePricing } from "@/lib/budget";
import { getDb } from "@/lib/db";

export const metadata = { title: "Tarifs de l'estimateur" };

export default async function PricingPage() {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const settings = await db.siteSettings.findUnique({ where: { id: "main" }, select: { pricing: true } });
  return (
    <>
      <PageHeader
        title="Tarifs de l'estimateur"
        description="Estimation = (base + fonctionnalités) × délai × design, puis ± la largeur de fourchette, convertie en MAD et USD. Montants en EUR."
      />
      <PricingEditor action={savePricing} initial={parsePricing(settings?.pricing)} />
    </>
  );
}
