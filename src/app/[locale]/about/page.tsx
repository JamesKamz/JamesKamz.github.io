import { Download, Gem, ShieldCheck, Target } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaBand } from "@/components/sections/CtaBand";
import { Skills } from "@/components/sections/Skills";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { getExperiences, getFaq, getSettings, getSkillGroups } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { loc } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "fr" | "en", namespace: "about" });
  const settings = await getSettings();
  return { title: t("title"), description: loc(settings, "tagline", locale), alternates: alternates("/about", locale) };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const [t, tc, settings, experiences, faq, skills] = await Promise.all([
    getTranslations("about"),
    getTranslations("common"),
    getSettings(),
    getExperiences(),
    getFaq(),
    getSkillGroups(),
  ]);
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", { month: "short", year: "numeric" });
  const values = [
    { icon: Target, title: t("value1Title"), body: t("value1") },
    { icon: ShieldCheck, title: t("value2Title"), body: t("value2") },
    { icon: Gem, title: t("value3Title"), body: t("value3") },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading as="h1" kicker={t("kicker")} title={t("title")} />
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-fg-soft">
              {loc(settings, "about", locale)
                .split(/\n{2,}/)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {settings.cvFrUrl ? (
                <a href={settings.cvFrUrl} target="_blank" rel="noopener" className={buttonClass(locale === "fr" || !settings.cvEnUrl ? "primary" : "secondary")}>
                  <Download className="size-4" aria-hidden /> {settings.cvEnUrl ? t("cvFr") : tc("downloadCv")}
                </a>
              ) : null}
              {settings.cvEnUrl ? (
                <a href={settings.cvEnUrl} target="_blank" rel="noopener" className={buttonClass(locale === "en" ? "primary" : "secondary")}>
                  <Download className="size-4" aria-hidden /> {t("cvEn")}
                </a>
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-5">
            {settings.photoUrl ? (
              <Reveal eager className="card relative mx-auto aspect-[4/5] max-w-sm overflow-hidden lg:-rotate-2">
                <Image src={settings.photoUrl} alt={settings.fullName} fill sizes="(min-width: 1024px) 24rem, 80vw" className="object-cover" />
              </Reveal>
            ) : null}
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl font-semibold">{t("values")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map(({ icon: Ico, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08} className="card p-6">
                <Ico className="size-6 text-accent" aria-hidden />
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-fg-soft">{body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-display text-3xl font-semibold">{t("timeline")}</h2>
          <ol className="relative mt-10 border-l border-line pl-8">
            {experiences.map((exp, i) => (
              <li key={exp.id} className="relative pb-10 last:pb-0">
                <span
                  className={`absolute -left-[2.35rem] top-1.5 size-3 rounded-full ring-4 ring-bg ${exp.endDate ? "bg-line-strong" : "bg-accent-2"}`}
                  aria-hidden
                />
                <Reveal delay={Math.min(i, 4) * 0.04}>
                  <p className="font-mono text-xs text-muted">
                    {fmt.format(new Date(exp.startDate))} — {exp.endDate ? fmt.format(new Date(exp.endDate)) : tc("present")}
                    <span className="ml-3 rounded border border-line px-1.5 py-0.5 text-[10px] uppercase">{t(`kind.${exp.kind}`)}</span>
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold">{loc(exp, "role", locale)}</h3>
                  <p className="text-accent">{exp.company}</p>
                  <p className="mt-2 max-w-2xl text-fg-soft">{loc(exp, "desc", locale)}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {faq.length ? (
          <section className="mt-24">
            <h2 className="font-display text-3xl font-semibold">{t("faq")}</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                    {loc(item, "question", locale)}
                    <span className="font-mono text-accent transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-fg-soft">{loc(item, "answer", locale)}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <Skills groups={skills} locale={locale} />
      <CtaBand />
    </>
  );
}
