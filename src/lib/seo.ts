import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
