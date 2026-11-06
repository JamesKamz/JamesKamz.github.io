import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandIcon } from "@/components/icons/BrandIcon";
import type { SettingsView } from "@/lib/types";

/** Discreet one-line mention of the YouTube channel (cybersecurity & AI). */
export async function Youtube({ settings }: { settings: SettingsView }) {
  if (!settings.youtube) return null;
  const t = await getTranslations("youtube");

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <a
        href={settings.youtube}
        target="_blank"
        rel="noopener noreferrer"
        className="card group flex flex-col gap-4 p-5 transition hover:border-line-strong sm:flex-row sm:items-center"
      >
        <BrandIcon brand="youtube" className="size-7 shrink-0 text-[#e0002a]" />
        <p className="text-fg-soft">{t("text")}</p>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-sm text-accent sm:ms-auto">
          {t("watch")}
          <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </span>
      </a>
    </section>
  );
}
