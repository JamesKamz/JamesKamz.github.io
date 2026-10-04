import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BudgetWizard } from "@/components/forms/BudgetWizard";
import { Zellige } from "@/components/site/Zellige";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPricing } from "@/lib/content";
import { alternates } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/budget">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "fr" | "en", namespace: "budget" });
  return { title: t("title"), description: t("subtitle"), alternates: alternates("/budget", locale) };
}

export default async function BudgetPage({ params }: PageProps<"/[locale]/budget">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const [t, pricing] = await Promise.all([getTranslations("budget"), getPricing()]);
  return (
    <div className="relative isolate">
      <Zellige id="zellige-budget" className="-z-10 [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" />
      <div className="mx-auto max-w-4xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
        <SectionHeading as="h1" kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-12">
          <BudgetWizard pricing={pricing} />
        </div>
      </div>
    </div>
  );
}
