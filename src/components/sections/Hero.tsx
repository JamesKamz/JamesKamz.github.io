import { ArrowRight, Calculator, MapPin } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { SocialLinks } from "@/components/site/SocialLinks";
import { Zellige } from "@/components/site/Zellige";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { SettingsView, StatView } from "@/lib/types";
import { loc, locList } from "@/lib/types";
import { RotatingTitles } from "./RotatingTitles";

export async function Hero({ settings, stats, locale }: { settings: SettingsView; stats: StatView[]; locale: string }) {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");
  const years = stats.find((s) => s.key === "years")?.value ?? 5;
  const titles = locList(settings, "titles", locale);

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-36 lg:pb-24">
      <div className="grid-bg absolute inset-0 -z-10 opacity-60" aria-hidden />
      <Zellige id="zellige-hero" className="-z-10 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div
        className="absolute -top-40 right-[-10%] -z-10 size-[38rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 65%)" }}
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-7">
          <p className="font-mono text-sm text-muted">
            <span className="text-accent-2">$</span> whoami
          </p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-tight">
            <span className="sr-only">{t("greeting")} </span>
            {settings.alias}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-3 font-mono text-sm text-muted">{settings.fullName}</p>

          <p className="mt-8 text-2xl font-medium leading-snug sm:text-3xl md:text-4xl">
            <span className="text-fg-soft">{t("iam")} </span>
            <RotatingTitles titles={titles} />
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-soft">{loc(settings, "tagline", locale)}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className={buttonClass("primary")}>
              {tc("startProject")}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/budget" className={buttonClass("secondary")}>
              <Calculator className="size-4" aria-hidden />
              {tc("estimateBudget")}
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-2 font-mono text-xs">
            {settings.comeup ? (
              <li>
                <a href={settings.comeup} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-fg-soft hover:border-accent">
                  <BrandIcon brand="comeup" className="size-3.5 text-accent" />
                  {t("trustComeup", { year: settings.comeupSince ?? 2023 })}
                </a>
              </li>
            ) : null}
            {settings.upwork ? (
              <li>
                <a href={settings.upwork} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-fg-soft hover:border-accent">
                  <BrandIcon brand="upwork" className="size-3.5 text-accent-2" />
                  {t("trustUpwork")}
                </a>
              </li>
            ) : null}
            <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-fg-soft">
              <span className="text-accent">★</span>
              {t("trustYears", { years })}
            </li>
          </ul>
        </div>

        <div className="lg:col-span-5 lg:pt-10">
          <figure className="card relative mx-auto max-w-md overflow-hidden shadow-2xl shadow-black/30 lg:ml-auto lg:rotate-[1.5deg]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-muted">~/james-kamz/profile.webp</span>
            </div>
            <div className="relative aspect-square bg-surface-2">
              {settings.photoUrl ? (
                <Image
                  src={settings.photoUrl}
                  alt={settings.fullName}
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" aria-hidden />
            </div>
            <figcaption className="grid gap-3 p-5 font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{t("status")}</span>
                <span className="inline-flex items-center gap-2 text-accent-2">
                  <span className="relative flex size-2">
                    {settings.available ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-2 opacity-60" /> : null}
                    <span className={`relative inline-flex size-2 rounded-full ${settings.available ? "bg-accent-2" : "bg-muted"}`} />
                  </span>
                  {settings.available ? loc(settings, "availability", locale) : tc("unavailable")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{t("location")}</span>
                <span className="inline-flex items-center gap-1.5 text-fg-soft">
                  <MapPin className="size-3.5" aria-hidden />
                  {loc(settings, "location", locale)}
                </span>
              </div>
            </figcaption>
          </figure>
          <SocialLinks settings={settings} className="mt-6 justify-center lg:justify-end" />
        </div>
      </div>
    </section>
  );
}
