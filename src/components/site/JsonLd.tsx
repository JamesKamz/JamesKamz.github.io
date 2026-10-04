import type { SettingsView } from "@/lib/types";
import { loc } from "@/lib/types";
import { SITE_URL, absoluteUrl } from "@/lib/utils";

/** Structured data: Person + ProfessionalService. */
export function JsonLd({ settings, locale }: { settings: SettingsView; locale: string }) {
  const sameAs = [
    settings.linkedin,
    settings.github,
    settings.youtube,
    settings.facebook,
    settings.instagram,
    settings.comeup,
    settings.upwork,
  ].filter(Boolean);
  const titles = locale === "en" ? settings.titlesEn : settings.titlesFr;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: settings.fullName,
        alternateName: settings.alias,
        jobTitle: titles.join(" · "),
        description: loc(settings, "tagline", locale),
        url: SITE_URL,
        email: `mailto:${settings.email}`,
        image: settings.photoUrl ? absoluteUrl(settings.photoUrl) : undefined,
        address: { "@type": "PostalAddress", addressCountry: "MA", addressLocality: loc(settings, "location", locale) },
        sameAs,
        knowsAbout: ["SaaS", "Next.js", "React", "Django", "FastAPI", "Odoo", "Automation", "n8n", "PostgreSQL"],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: `${settings.alias} — ${titles.join(", ")}`,
        url: SITE_URL,
        email: settings.email,
        founder: { "@id": `${SITE_URL}/#person` },
        areaServed: "Worldwide",
        address: { "@type": "PostalAddress", addressCountry: "MA" },
        priceRange: "€€",
        availableLanguage: ["fr", "en"],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; escape "<" to avoid breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
