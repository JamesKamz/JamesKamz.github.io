import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Youtube } from "@/components/sections/Youtube";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import {
  getProjects,
  getServices,
  getSettings,
  getSkillGroups,
  getStats,
  getTestimonials,
} from "@/lib/content";
import { getYoutubeChannel } from "@/lib/youtube";

export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const [settings, stats, services, projects, testimonials, skills, t, tc] = await Promise.all([
    getSettings(),
    getStats(),
    getServices(),
    getProjects(),
    getTestimonials(),
    getSkillGroups(),
    getTranslations("projects"),
    getTranslations("common"),
  ]);
  const channel = await getYoutubeChannel(settings.youtubeHandle ?? "");
  const liveStats = stats.map((s) =>
    s.key === "youtubeSubscribers" && channel?.subscribers ? { ...s, value: channel.subscribers, visible: true } : s,
  );

  return (
    <>
      <Hero settings={settings} stats={liveStats} locale={locale} />
      <Stats stats={liveStats} locale={locale} />
      <Services services={services} locale={locale} />

      <section id="projects" className="scroll-mt-20 border-t border-line py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
            <Link href="/projects" className="font-mono text-sm text-accent hover:underline">
              {tc("viewAll")} →
            </Link>
          </div>
          <ProjectsGrid projects={projects} locale={locale} />
        </div>
      </section>

      <Testimonials testimonials={testimonials} settings={settings} locale={locale} />
      <Youtube channel={channel} settings={settings} stats={liveStats} locale={locale} />
      <Skills groups={skills} locale={locale} />
      <div className="pt-8 pb-8">
        <CtaBand />
      </div>
    </>
  );
}
