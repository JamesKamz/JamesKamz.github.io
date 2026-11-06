import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SkillGroupView } from "@/lib/types";
import { loc } from "@/lib/types";

export async function Skills({ groups, locale }: { groups: SkillGroupView[]; locale: string }) {
  const t = await getTranslations("skills");
  return (
    <section id="skills" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, i) => (
            <Reveal key={group.id} delay={(i % 4) * 0.06} className="group bg-surface p-6 transition hover:bg-surface-2">
              <div className="flex items-center gap-3">
                <span className="text-accent transition group-hover:rotate-12">
                  <Icon name={group.icon} />
                </span>
                <h3 className="font-display text-lg font-semibold">{loc(group, "name", locale)}</h3>
              </div>
              <p className="mt-4 font-mono text-[11px] text-muted">
                <span className="text-accent-2">$</span> ls ./{group.slug}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item} className="rounded-md border border-line bg-bg-elev px-2 py-1 text-sm text-fg-soft">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
