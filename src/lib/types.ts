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

export type Locale = "fr" | "en" | "ar";

/** BCP 47 tag for Intl APIs. `ar-MA` keeps Latin digits, as used in Morocco. */
export function intlLocale(locale: string) {
  return locale === "en" ? "en-US" : locale === "ar" ? "ar-MA" : "fr-FR";
}

/** Arabic columns are optional in views: bundled defaults omit them and `loc` falls back to English. */
type ArKeys<T> = Extract<keyof T, `${string}Ar`>;
type OptionalAr<T> = Omit<T, ArKeys<T>> & Partial<Pick<T, ArKeys<T>>>;

export type SettingsView = OptionalAr<Omit<SiteSettings, "updatedAt" | "pricing">> & { pricing: PricingConfig };
export type StatView = OptionalAr<Stat>;
export type ServiceView = OptionalAr<Service>;
export type ProjectView = OptionalAr<Omit<Project, "createdAt" | "updatedAt">> & { updatedAt?: Date };
export type TestimonialView = OptionalAr<Omit<Testimonial, "createdAt" | "email">>;
export type SkillGroupView = OptionalAr<SkillGroup>;
export type ExperienceView = OptionalAr<Experience>;
export type FaqView = OptionalAr<FaqEntry>;

const SUFFIX: Record<string, string> = { fr: "Fr", en: "En", ar: "Ar" };
// Arabic content falls back to English, everything else to French.
const fallbacks = (locale: string) => (locale === "ar" ? ["Ar", "En", "Fr"] : [SUFFIX[locale] ?? "Fr", "Fr"]);

/** Pick the localized variant of a multilingual field (`titleFr` / `titleEn` / `titleAr`). */
export function loc<T extends object, K extends string>(
  obj: T,
  field: K,
  locale: string,
): string {
  const record = obj as Record<string, unknown>;
  for (const suffix of fallbacks(locale)) {
    const value = record[`${field}${suffix}`];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function locList<T extends object>(obj: T, field: string, locale: string): string[] {
  const record = obj as Record<string, unknown>;
  for (const suffix of fallbacks(locale)) {
    const value = record[`${field}${suffix}`];
    if (Array.isArray(value) && value.length) return value as string[];
  }
  return [];
}
