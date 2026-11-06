import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/projects": { fr: "/projets", en: "/projects", ar: "/projects" },
    "/projects/[slug]": { fr: "/projets/[slug]", en: "/projects/[slug]", ar: "/projects/[slug]" },
    "/about": { fr: "/a-propos", en: "/about", ar: "/about" },
    "/contact": "/contact",
    "/budget": "/budget",
    "/legal": { fr: "/mentions-legales", en: "/legal-notice", ar: "/legal-notice" },
    "/privacy": { fr: "/confidentialite", en: "/privacy", ar: "/privacy" },
    "/review/[token]": { fr: "/avis/[token]", en: "/review/[token]", ar: "/review/[token]" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
