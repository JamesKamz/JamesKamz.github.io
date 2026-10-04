import { ArrowRight, Calculator } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/site/Reveal";
import { Zellige } from "@/components/site/Zellige";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export async function CtaBand() {
  const t = await getTranslations("cta");
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <Reveal className="card relative mx-auto max-w-7xl overflow-hidden px-6 py-16 sm:px-12 sm:py-20">
        <Zellige id="zellige-cta" className="[mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }} aria-hidden />
        <div className="relative max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">{t("title")}</h2>
          <p className="mt-4 text-lg text-fg-soft">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/budget" className={buttonClass("primary")}>
              <Calculator className="size-4" aria-hidden />
              {t("primary")}
            </Link>
            <Link href="/contact" className={buttonClass("secondary")}>
              {t("secondary")}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
