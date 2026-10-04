import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { Reveal } from "@/components/site/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProject, getProjects } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { loc } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  const title = loc(project, "title", locale);
  const description = loc(project, "summary", locale);
  return {
    title,
    description,
    alternates: alternates({ pathname: "/projects/[slug]", params: { slug } }, locale),
    openGraph: { title, description, images: project.coverImage ? [{ url: project.coverImage }] : undefined },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as "fr" | "en");
  const [project, projects, t, tc] = await Promise.all([
    getProject(slug),
    getProjects(),
    getTranslations("projects"),
    getTranslations("common"),
  ]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const title = loc(project, "title", locale);
  const sections = [
    { key: "problem", label: t("problem"), body: loc(project, "problem", locale), n: "01" },
    { key: "solution", label: t("solution"), body: loc(project, "solution", locale), n: "02" },
    { key: "result", label: t("result"), body: loc(project, "result", locale), n: "03" },
  ];
  const gallery = project.gallery.filter((src) => src !== project.coverImage);

  return (
    <article className="pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-accent">
          <ArrowLeft className="size-4" aria-hidden /> {tc("back")}
        </Link>

        <header className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="kicker">projects/{project.slug} $</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-xl text-fg-soft">{loc(project, "summary", locale)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 font-mono text-sm lg:col-span-4">
            {project.year ? (
              <div>
                <dt className="text-xs text-muted">{t("year")}</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted">{t("categories")}</dt>
              <dd className="mt-1">{project.categories.map((c) => t(`filters.${c}`)).join(", ")}</dd>
            </div>
            <div className="col-span-2 flex flex-wrap gap-3 pt-2">
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "px-4 py-2.5")}>
                  {tc("visitSite")} <ExternalLink className="size-4" aria-hidden />
                </a>
              ) : null}
              {project.repoUrl ? (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "px-4 py-2.5")}>
                  <BrandIcon brand="github" /> {tc("sourceCode")}
                </a>
              ) : null}
            </div>
          </dl>
        </header>

        {project.coverImage ? (
          <Reveal className="card relative mt-12 aspect-[16/9] overflow-hidden">
            <Image src={project.coverImage} alt={title} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover object-top" />
          </Reveal>
        ) : null}

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            {sections.map((s) => (
              <Reveal key={s.key} className="grid gap-4 border-t border-line pt-8 sm:grid-cols-[8rem_1fr]">
                <p className="font-mono text-sm text-accent">
                  {s.n} <span className="text-muted">/</span>
                </p>
                <div>
                  <h2 className="font-display text-2xl font-semibold">{s.label}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-fg-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <aside className="lg:col-span-4">
            <div className="card sticky top-24 p-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted">{t("stack")}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li key={s} className="rounded-md border border-line bg-bg-elev px-2.5 py-1 text-sm">
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-line pt-6">
                <p className="font-display text-lg font-semibold">{t("similar")}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/budget" className={buttonClass("primary", "w-full")}>{tc("estimateBudget")}</Link>
                  <Link href="/contact" className={buttonClass("secondary", "w-full")}>{tc("startProject")}</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {gallery.length ? (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold">{t("gallery")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {gallery.map((src, i) => (
                <Reveal key={src} delay={i * 0.05} className="card relative aspect-[16/10] overflow-hidden">
                  <Image src={src} alt={`${title} — ${i + 1}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {next && next.slug !== project.slug ? (
          <Link
            href={{ pathname: "/projects/[slug]", params: { slug: next.slug } }}
            className="group mt-24 flex items-center justify-between gap-6 border-y border-line py-10"
          >
            <span>
              <span className="font-mono text-xs text-muted">{t("next")}</span>
              <span className="mt-2 block font-display text-3xl font-semibold transition group-hover:text-accent sm:text-5xl">
                {loc(next, "title", locale)}
              </span>
            </span>
            <ArrowRight className="size-8 shrink-0 transition group-hover:translate-x-2 group-hover:text-accent" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
