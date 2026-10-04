import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProjectView } from "@/lib/types";
import { loc } from "@/lib/types";

export function ProjectCard({ project, locale, priority = false }: { project: ProjectView; locale: string; priority?: boolean }) {
  const t = useTranslations("projects");
  const title = loc(project, "title", locale);
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-line-strong">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-2">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {project.categories.map((c) => (
            <span key={c} className="rounded-md bg-bg/85 px-2 py-1 font-mono text-[11px] text-fg backdrop-blur">
              {t(`filters.${c}`)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold tracking-tight">
            <Link href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }} className="after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
        </div>
        <p className="mt-2 text-fg-soft">{loc(project, "summary", locale)}</p>
        <p className="mt-auto pt-5 font-mono text-xs text-muted">{project.stack.slice(0, 4).join(" · ")}</p>
      </div>
    </article>
  );
}
