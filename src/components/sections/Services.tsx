import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import type { ServiceView } from "@/lib/types";
import { loc } from "@/lib/types";
import { cn } from "@/lib/utils";

const span: Record<string, string> = {
  lg: "md:col-span-4",
  md: "md:col-span-2",
  sm: "md:col-span-3",
};

export async function Services({ services, locale }: { services: ServiceView[]; locale: string }) {
  const t = await getTranslations("services");
  return (
    <section id="services" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
          <Link href="/contact" className="group inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline">
            {t("cta")}
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {services.map((service, i) => {
            const big = service.size === "lg";
            return (
              <Reveal
                key={service.id}
                delay={(i % 3) * 0.08}
                className={cn(
                  "card group relative flex min-h-64 flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-line-strong sm:p-8",
                  span[service.size] ?? span.md,
                )}
              >
                <div
                  className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
                  aria-hidden
                />
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-xl border border-line bg-bg-elev text-accent">
                    <Icon name={service.icon} className="size-6" />
                  </span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className={cn("mt-8 font-display font-semibold tracking-tight", big ? "text-3xl sm:text-4xl" : "text-2xl")}>
                  {loc(service, "title", locale)}
                </h3>
                <p className={cn("mt-3 text-fg-soft", big ? "max-w-xl text-lg" : "")}>{loc(service, "desc", locale)}</p>
                {service.tags.length ? (
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {service.tags.map((tag) => (
                      <li key={tag} className="rounded-md border border-line bg-bg-elev px-2 py-1 font-mono text-[11px] text-muted">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
