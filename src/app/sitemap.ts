import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

type Href = Parameters<typeof getPathname>[0]["href"];

export const revalidate = 3600;

function entry(href: Href, priority: number, lastModified?: Date): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(getPathname({ locale: l, href }))]));
  return routing.locales.map((locale) => ({
    url: absoluteUrl(getPathname({ locale, href })),
    lastModified: lastModified ?? new Date(),
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    ...entry("/", 1),
    ...entry("/projects", 0.8),
    ...entry("/budget", 0.8),
    ...entry("/about", 0.7),
    ...entry("/contact", 0.7),
    ...projects.flatMap((p) => entry({ pathname: "/projects/[slug]", params: { slug: p.slug } }, 0.6)),
    ...entry("/legal", 0.2),
    ...entry("/privacy", 0.2),
  ];
}
