import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSettings } from "./content";
import type { Locale } from "./types";
import { absoluteUrl } from "./utils";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Canonical URL + hreflang alternates for a route in every locale. */
export function alternates(href: Href, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(getPathname({ locale: l, href }));
  }
  languages["x-default"] = languages[routing.defaultLocale];
  return {
    canonical: absoluteUrl(getPathname({ locale: locale as (typeof routing.locales)[number], href })),
    languages,
  };
}

export const OG_LOCALES: Record<Locale, string> = { fr: "fr_FR", en: "en_US", ar: "ar_MA" };

/**
 * Full page metadata. A page's `openGraph` replaces the layout's instead of merging,
 * so every page rebuilds it here (URL, locale, site name) to keep share previews right.
 */
export async function pageMetadata({
  title,
  description,
  href,
  locale,
  type = "website",
  images,
  index = true,
}: {
  title: string;
  description: string;
  href: Href;
  locale: string;
  type?: "website" | "article";
  images?: string[];
  index?: boolean;
}): Promise<Metadata> {
  const { alias } = await getSettings();
  const url = absoluteUrl(getPathname({ locale: locale as Locale, href }));
  return {
    title,
    description,
    alternates: alternates(href, locale),
    openGraph: {
      type,
      siteName: alias,
      title,
      description,
      url,
      locale: OG_LOCALES[locale as Locale],
      alternateLocale: Object.entries(OG_LOCALES).filter(([l]) => l !== locale).map(([, og]) => og),
      ...(images?.length ? { images: images.map((url) => ({ url })) } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(images?.length ? { images } : {}) },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
