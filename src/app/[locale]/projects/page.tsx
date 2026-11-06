import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaBand } from "@/components/sections/CtaBand";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "projects" });
  return pageMetadata({ title: t("title"), description: t("subtitle"), href: "/projects", locale });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const [t, projects] = await Promise.all([getTranslations("projects"), getProjects()]);
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <SectionHeading as="h1" kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} className="mb-12" />
        <ProjectsGrid projects={projects} locale={locale} eager headingLevel={2} />
      </div>
      <CtaBand />
    </>
  );
}
