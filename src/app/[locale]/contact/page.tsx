import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { SocialLinks } from "@/components/site/SocialLinks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSettings } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { whatsappUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "fr" | "en", namespace: "contact" });
  return { title: t("title"), description: t("subtitle"), alternates: alternates("/contact", locale) };
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const sp = await searchParams;
  const budget = typeof sp.budget === "string" ? sp.budget.slice(0, 100) : undefined;
  const [t, settings] = await Promise.all([getTranslations("contact"), getSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading as="h1" kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
          <div className="mt-10 space-y-3">
            <a href={`mailto:${settings.email}`} className="card flex items-center gap-4 p-4 transition hover:border-accent">
              <Mail className="size-5 text-accent" aria-hidden />
              <span>{settings.email}</span>
            </a>
            {settings.whatsapp ? (
              <a href={whatsappUrl(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-4 transition hover:border-accent">
                <BrandIcon brand="whatsapp" className="size-5 text-accent-2" />
                <span>{t("whatsapp")}</span>
              </a>
            ) : null}
          </div>
          <SocialLinks settings={settings} className="mt-8" />
        </div>
        <div className="lg:col-span-7">
          <ContactForm defaultBudget={budget} />
        </div>
      </div>
    </div>
  );
}
