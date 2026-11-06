import type { SettingsView } from "@/lib/types";
import { loc, locList } from "@/lib/types";
import { SITE_URL, absoluteUrl } from "@/lib/utils";

/** Structured data: WebSite + Person + ProfessionalService. */
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
  const titles = locList(settings, "titles", locale);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: settings.alias,
        url: SITE_URL,
        inLanguage: ["fr", "en", "ar"],
        publisher: { "@id": `${SITE_URL}/#person` },
      },
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
        knowsAbout: ["SaaS", "Full-stack development", "Web applications", "Odoo", "Artificial intelligence", "AI chatbots", "Python", "Next.js", "Automation"],
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
        availableLanguage: ["fr", "en", "ar"],
      },
    ],
  };
  return <JsonLdScript data={data} />;
}

/** Renders any schema.org object as a JSON-LD script. */
export function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; escape "<" to avoid breaking out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
