import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/content";
import { alternates } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Privacy policy" : "Politique de confidentialité", alternates: alternates("/privacy", locale) };
}

export default async function Privacy({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale as "fr" | "en");
  const s = await getSettings();
  const en = locale === "en";
  return (
    <LegalPage
      title={en ? "Privacy policy" : "Politique de confidentialité"}
      updated={en ? "Last updated: October 2026" : "Dernière mise à jour : octobre 2026"}
      sections={[
        {
          h: en ? "Data collected" : "Données collectées",
          p: [
            en
              ? "Contact form and budget estimator: name, email, optional phone, company and message, plus the selected project options. Chatbot: the messages you send, linked to an anonymised identifier (salted hash of your IP)."
              : "Formulaire de contact et estimateur : nom, email, téléphone et entreprise optionnels, message, ainsi que les options de projet choisies. Chatbot : les messages envoyés, associés à un identifiant anonymisé (empreinte salée de l'adresse IP).",
          ],
        },
        {
          h: en ? "Purpose" : "Finalités",
          p: [
            en
              ? "Your data is only used to answer your request, prepare a quote and improve the assistant's answers. It is never sold or shared for marketing."
              : "Vos données servent uniquement à répondre à votre demande, préparer un devis et améliorer les réponses de l'assistant. Elles ne sont jamais vendues ni utilisées à des fins publicitaires.",
          ],
        },
        {
          h: en ? "Processors" : "Sous-traitants",
          p: [
            en
              ? "Vercel (hosting), Neon/Supabase (database), Resend (email delivery), Anthropic (chatbot answers), Google (YouTube video embeds)."
              : "Vercel (hébergement), Neon/Supabase (base de données), Resend (envoi d'emails), Anthropic (réponses du chatbot), Google (vidéos YouTube).",
          ],
        },
        {
          h: en ? "Retention & cookies" : "Conservation & cookies",
          p: [
            en
              ? "Messages and leads are kept for up to 3 years after the last contact. The site uses no advertising or tracking cookies; only your theme and language preferences are stored locally."
              : "Les messages et demandes sont conservés au maximum 3 ans après le dernier contact. Le site n'utilise aucun cookie publicitaire ou de suivi ; seules vos préférences de thème et de langue sont enregistrées localement.",
          ],
        },
        {
          h: en ? "Your rights" : "Vos droits",
          p: [
            en
              ? `You can request access, correction or deletion of your data at any time: ${s.email}.`
              : `Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment : ${s.email}.`,
          ],
        },
      ]}
    />
  );
}
