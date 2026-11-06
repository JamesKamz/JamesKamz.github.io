import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/site/Reveal";
import type { StatView } from "@/lib/types";
import { loc } from "@/lib/types";
import { CountUp } from "./CountUp";

export async function Stats({ stats, locale }: { stats: StatView[]; locale: string }) {
  const t = await getTranslations("stats");
  const visible = stats.filter((s) => s.visible);
  if (!visible.length) return null;
  return (
    <section aria-label={t("title")} className="border-y border-line bg-bg-elev">
      <div
        className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-line md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": visible.length } as React.CSSProperties}
      >
        {visible.map((stat, i) => (
          <Reveal
            key={stat.id}
            delay={i * 0.06}
            className="bg-bg-elev px-4 py-8 sm:px-8 md:py-10"
          >
            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {stat.prefix}
              <CountUp value={stat.value} decimals={stat.decimals} locale={locale} />
              <span className="text-accent">{stat.suffix}</span>
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">{loc(stat, "label", locale)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
