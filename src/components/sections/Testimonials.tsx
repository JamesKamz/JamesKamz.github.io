import { ExternalLink, Quote, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SettingsView, TestimonialView } from "@/lib/types";
import { loc } from "@/lib/types";

function Badges({ settings, t }: { settings: SettingsView; t: Awaited<ReturnType<typeof getTranslations<"testimonials">>> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {settings.comeup ? (
        <a href={settings.comeup} target="_blank" rel="noopener noreferrer" className="card inline-flex items-center gap-3 px-4 py-3 transition hover:border-accent">
          <BrandIcon brand="comeup" className="size-6 text-accent" />
          <span className="text-sm font-medium">{t("badgeComeup", { year: settings.comeupSince ?? 2023 })}</span>
          <ExternalLink className="size-3.5 text-muted" aria-hidden />
        </a>
      ) : null}
      {settings.upwork ? (
        <a href={settings.upwork} target="_blank" rel="noopener noreferrer" className="card inline-flex items-center gap-3 px-4 py-3 transition hover:border-accent">
          <BrandIcon brand="upwork" className="size-6 text-accent-2" />
          <span className="text-sm font-medium">{t("badgeUpwork")}</span>
          <ExternalLink className="size-3.5 text-muted" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

export async function Testimonials({
  testimonials,
  settings,
  locale,
}: {
  testimonials: TestimonialView[];
  settings: SettingsView;
  locale: string;
}) {
  const t = await getTranslations("testimonials");
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading kicker={t("kicker")} title={t("title")} />
          <Badges settings={settings} t={t} />
        </div>

        {testimonials.length === 0 ? (
          <p className="mt-10 max-w-xl text-fg-soft">{t("empty")}</p>
        ) : (
          <ul className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {testimonials.map((item, i) => (
              <li key={item.id} className="mb-5 break-inside-avoid">
                <Reveal delay={(i % 3) * 0.08} className="card relative p-6">
                  <Quote className="absolute right-5 top-5 size-8 text-line-strong" aria-hidden />
                  <div className="flex gap-0.5 text-accent" role="img" aria-label={t("rating", { rating: item.rating })}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} className={`size-4 ${s < item.rating ? "fill-current" : "opacity-30"}`} aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-fg-soft">“{loc(item, "text", locale)}”</blockquote>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
                    <div>
                      <p className="font-medium">{item.authorName}</p>
                      <p className="font-mono text-xs text-muted">
                        {[item.authorRole, item.country].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <p className="text-accent-2">{t(`platform.${item.platform}`)}</p>
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-2 hover:text-accent hover:underline">
                          {t("viewSource")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
