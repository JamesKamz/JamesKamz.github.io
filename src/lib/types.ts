import type {
  Experience,
  FaqEntry,
  Project,
  Service,
  SiteSettings,
  SkillGroup,
  Stat,
  Testimonial,
} from "@/generated/prisma/client";
import type { PricingConfig } from "./budget";

export type Locale = "fr" | "en";

export type SettingsView = Omit<SiteSettings, "updatedAt" | "pricing"> & { pricing: PricingConfig };
export type StatView = Stat;
export type ServiceView = Service;
export type ProjectView = Omit<Project, "createdAt" | "updatedAt">;
export type TestimonialView = Omit<Testimonial, "createdAt">;
export type SkillGroupView = SkillGroup;
export type ExperienceView = Experience;
export type FaqView = FaqEntry;

/** Pick the localized variant of a bilingual field (`titleFr` / `titleEn`). */
export function loc<T extends object, K extends string>(
  obj: T,
  field: K,
  locale: string,
): string {
  const record = obj as Record<string, unknown>;
  const suffix = locale === "en" ? "En" : "Fr";
  const value = record[`${field}${suffix}`];
  if (typeof value === "string" && value.trim()) return value;
  const fallback = record[`${field}Fr`];
  return typeof fallback === "string" ? fallback : "";
}

export function locList<T extends object>(obj: T, field: string, locale: string): string[] {
  const record = obj as Record<string, unknown>;
  const value = record[`${field}${locale === "en" ? "En" : "Fr"}`];
  if (Array.isArray(value) && value.length) return value as string[];
  return (record[`${field}Fr`] as string[] | undefined) ?? [];
}
