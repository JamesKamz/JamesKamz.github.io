import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { loc } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/legal">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Legal notice" : "Mentions légales", alternates: alternates("/legal", locale), robots: { index: false } };
}

export default async function Legal({ params }: PageProps<"/[locale]/legal">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const s = await getSettings();
  const en = locale === "en";
  return (
    <LegalPage
      title={en ? "Legal notice" : "Mentions légales"}
      updated={en ? "Last updated: October 2026" : "Dernière mise à jour : octobre 2026"}
      sections={[
        {
          h: en ? "Publisher" : "Éditeur du site",
          p: [
            `${s.fullName} (${s.alias}) — ${en ? "independent developer" : "développeur indépendant"}, ${loc(s, "location", locale)}.`,
            `${en ? "Contact" : "Contact"} : ${s.email}`,
          ],
        },
        {
          h: en ? "Hosting" : "Hébergement",
          p: ["Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com"],
        },
        {
          h: en ? "Intellectual property" : "Propriété intellectuelle",
          p: [
            en
              ? "All content on this site (texts, visuals, code) is the property of its author unless otherwise stated. Project screenshots belong to their respective owners and are shown as portfolio references."
              : "L'ensemble des contenus de ce site (textes, visuels, code) est la propriété de son auteur, sauf mention contraire. Les captures de projets appartiennent à leurs propriétaires respectifs et sont présentées à titre de références.",
          ],
        },
        {
          h: en ? "Liability" : "Responsabilité",
          p: [
            en
              ? "Budget estimates and chatbot answers are indicative and non-binding. Only a signed quote is contractual."
              : "Les estimations de budget et les réponses du chatbot sont indicatives et non contractuelles. Seul un devis signé engage les parties.",
          ],
        },
      ]}
    />
  );
}
