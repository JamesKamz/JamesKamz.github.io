import "server-only";
import { cache } from "react";
import {
  defaultExperiences,
  defaultFaq,
  defaultProjects,
  defaultServices,
  defaultSettings,
  defaultSkillGroups,
  defaultStats,
  defaultTestimonials,
} from "@/content/defaults";
import { parsePricing } from "./budget";
import { getDb } from "./db";
import type {
  ExperienceView,
  FaqView,
  ProjectView,
  ServiceView,
  SettingsView,
  SkillGroupView,
  StatView,
  TestimonialView,
} from "./types";

/**
 * Read-side content layer. Every getter queries Postgres and falls back to the
 * bundled default content when the database is missing or unreachable, so the
 * public site never breaks (and `next build` works without a database).
 */
async function withFallback<T>(label: string, query: () => Promise<T | null>, fallback: T): Promise<T> {
  const db = getDb();
  if (!db) return fallback;
  try {
    const result = await query();
    return result ?? fallback;
  } catch (error) {
    console.error(`[content] ${label} failed, using defaults:`, (error as Error).message);
    return fallback;
  }
}

export const getSettings = cache(
  (): Promise<SettingsView> =>
    withFallback(
      "settings",
      async () => {
        const row = await getDb()!.siteSettings.findUnique({ where: { id: "main" } });
        if (!row) return null;
        const { updatedAt: _updatedAt, ...rest } = row;
        return { ...rest, pricing: parsePricing(row.pricing) };
      },
      defaultSettings,
    ),
);

export const getStats = cache(
  (): Promise<StatView[]> =>
    withFallback("stats", () => getDb()!.stat.findMany({ orderBy: { order: "asc" } }), defaultStats),
);

export const getServices = cache(
  (): Promise<ServiceView[]> =>
    withFallback(
      "services",
      () => getDb()!.service.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      defaultServices,
    ),
);

export const getProjects = cache(
  (): Promise<ProjectView[]> =>
    withFallback(
      "projects",
      () => getDb()!.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      defaultProjects,
    ),
);

export const getProject = cache(
  async (slug: string): Promise<ProjectView | null> => {
    const projects = await getProjects();
    return projects.find((p) => p.slug === slug) ?? null;
  },
);

export const getTestimonials = cache(
  (): Promise<TestimonialView[]> =>
    withFallback(
      "testimonials",
      () =>
        getDb()!.testimonial.findMany({
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        }),
      defaultTestimonials.filter((t) => t.published),
    ),
);

export const getSkillGroups = cache(
  (): Promise<SkillGroupView[]> =>
    withFallback("skills", () => getDb()!.skillGroup.findMany({ orderBy: { order: "asc" } }), defaultSkillGroups),
);

export const getExperiences = cache(
  (): Promise<ExperienceView[]> =>
    withFallback(
      "experiences",
      () => getDb()!.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] }),
      defaultExperiences,
    ),
);

export const getFaq = cache(
  (): Promise<FaqView[]> =>
    withFallback(
      "faq",
      () => getDb()!.faqEntry.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      defaultFaq,
    ),
);

export const getPricing = cache(async () => (await getSettings()).pricing);
