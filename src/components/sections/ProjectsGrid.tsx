"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectCategory } from "@/generated/prisma/enums";
import { Link } from "@/i18n/navigation";
import type { ProjectView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

const filters = ["ALL", ...Object.values(ProjectCategory)] as const;
type Filter = (typeof filters)[number];

export function ProjectsGrid({ projects, locale }: { projects: ProjectView[]; locale: string }) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const [filter, setFilter] = useState<Filter>("ALL");
  const visible = filter === "ALL" ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <div>
      <div role="group" aria-label={t("categories")} className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f === "ALL" ? projects.length : projects.filter((p) => p.categories.includes(f)).length;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-xs transition",
                filter === f
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-line text-fg-soft hover:border-line-strong hover:text-fg",
              )}
            >
              {t(`filters.${f}`)} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length ? (
        <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.li
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} locale={locale} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="card mt-10 flex flex-col items-start gap-4 p-8">
          <p className="font-mono text-sm text-muted">
            <span className="text-accent-2">$</span> ls ./{filter.toLowerCase()} <span className="text-fg-soft">→ 0</span>
          </p>
          <p className="max-w-xl text-fg-soft">{t("empty")}</p>
          <Link href="/contact" className="font-mono text-sm text-accent hover:underline">
            {tc("startProject")} →
          </Link>
        </div>
      )}
    </div>
  );
}
