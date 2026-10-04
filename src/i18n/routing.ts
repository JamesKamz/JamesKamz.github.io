import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/projects": { fr: "/projets", en: "/projects" },
    "/projects/[slug]": { fr: "/projets/[slug]", en: "/projects/[slug]" },
    "/about": { fr: "/a-propos", en: "/about" },
    "/contact": "/contact",
    "/budget": "/budget",
    "/legal": { fr: "/mentions-legales", en: "/legal-notice" },
    "/privacy": { fr: "/confidentialite", en: "/privacy" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
