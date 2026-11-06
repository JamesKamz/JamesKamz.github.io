import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";

export const revalidate = 3600;

const TITLE = { fr: "Politique de confidentialité", en: "Privacy policy", ar: "سياسة الخصوصية" };
const DESCRIPTION = {
  fr: "Quelles données ce site collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits.",
  en: "What data this site collects, why, how long it is kept and how to exercise your rights.",
  ar: "ما البيانات التي يجمعها هذا الموقع، ولماذا، ومدة حفظها، وكيف تمارس حقوقك.",
};

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ title: TITLE[locale as Locale], description: DESCRIPTION[locale as Locale], href: "/privacy", locale });
}

export default async function Privacy({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const s = await getSettings();
  const t = (text: Record<Locale, string>) => text[locale as Locale];
  return (
    <LegalPage
      title={TITLE[locale as Locale]}
      updated={t({ fr: "Dernière mise à jour : novembre 2026", en: "Last updated: November 2026", ar: "آخر تحديث: نوفمبر 2026" })}
      sections={[
        {
          h: t({ fr: "Données collectées", en: "Data collected", ar: "البيانات المجمَّعة" }),
          p: [
            t({
              fr: "Formulaire de contact et estimateur : nom, email, téléphone et entreprise optionnels, message, ainsi que les options de projet choisies. Chatbot : les messages envoyés, associés à un identifiant anonymisé (empreinte salée de l'adresse IP).",
              en: "Contact form and budget estimator: name, email, optional phone, company and message, plus the selected project options. Chatbot: the messages you send, linked to an anonymised identifier (salted hash of your IP).",
              ar: "نموذج التواصل ومُقدِّر الميزانية: الاسم والبريد الإلكتروني، والهاتف واسم الشركة اختياريًا، والرسالة، إضافةً إلى خيارات المشروع المختارة. المساعد الذكي: الرسائل التي ترسلها، مرتبطة بمعرّف مجهول الهوية (بصمة مُملَّحة لعنوان IP).",
            }),
            t({
              fr: "Statistiques de visite, sans cookie : page consultée, site d'origine, pays et ville approximatifs, type d'appareil, navigateur et système. Les visiteurs sont comptés par une empreinte salée de l'adresse IP et du navigateur ; l'adresse IP elle-même n'est jamais enregistrée.",
              en: "Cookie-free visit statistics: page viewed, referring site, approximate country and city, device type, browser and operating system. Visitors are counted with a salted hash of the IP address and browser; the IP address itself is never stored.",
              ar: "إحصاءات الزيارات دون ملفات تعريف الارتباط: الصفحة المعروضة، والموقع المُحيل، والبلد والمدينة بشكل تقريبي، ونوع الجهاز، والمتصفح ونظام التشغيل. يُحتسب الزوار ببصمة مُملَّحة لعنوان IP والمتصفح، ولا يُحفظ عنوان IP نفسه أبدًا.",
            }),
          ],
        },
        {
          h: t({ fr: "Finalités", en: "Purpose", ar: "الغرض" }),
          p: [
            t({
              fr: "Vos données servent uniquement à répondre à votre demande, préparer un devis et améliorer les réponses de l'assistant. Elles ne sont jamais vendues ni utilisées à des fins publicitaires.",
              en: "Your data is only used to answer your request, prepare a quote and improve the assistant's answers. It is never sold or shared for marketing.",
              ar: "تُستخدم بياناتك فقط للرد على طلبك وإعداد عرض سعر وتحسين إجابات المساعد. لا تُباع أبدًا ولا تُستخدم لأغراض تسويقية.",
            }),
          ],
        },
        {
          h: t({ fr: "Sous-traitants", en: "Processors", ar: "مزوّدو الخدمات" }),
          p: [
            t({
              fr: "Vercel (hébergement), Neon/Supabase (base de données), Resend (envoi d'emails), Anthropic (réponses du chatbot), Google (vidéos YouTube).",
              en: "Vercel (hosting), Neon/Supabase (database), Resend (email delivery), Anthropic (chatbot answers), Google (YouTube video embeds).",
              ar: "Vercel (الاستضافة)، Neon/Supabase (قاعدة البيانات)، Resend (إرسال البريد الإلكتروني)، Anthropic (إجابات المساعد الذكي)، Google (فيديوهات YouTube).",
            }),
          ],
        },
        {
          h: t({ fr: "Conservation & cookies", en: "Retention & cookies", ar: "مدة الحفظ وملفات تعريف الارتباط" }),
          p: [
            t({
              fr: "Les messages et demandes sont conservés au maximum 3 ans après le dernier contact. Le site n'utilise aucun cookie publicitaire ou de suivi ; seules vos préférences de thème et de langue sont enregistrées localement.",
              en: "Messages and leads are kept for up to 3 years after the last contact. The site uses no advertising or tracking cookies; only your theme and language preferences are stored locally.",
              ar: "تُحفظ الرسائل والطلبات لمدة أقصاها 3 سنوات بعد آخر تواصل. لا يستخدم الموقع أي ملفات تعريف ارتباط إعلانية أو للتتبع؛ تُحفظ فقط تفضيلات المظهر واللغة محليًا على جهازك.",
            }),
          ],
        },
        {
          h: t({ fr: "Vos droits", en: "Your rights", ar: "حقوقك" }),
          p: [
            t({
              fr: `Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment : ${s.email}.`,
              en: `You can request access, correction or deletion of your data at any time: ${s.email}.`,
              ar: `يمكنك في أي وقت طلب الاطلاع على بياناتك أو تصحيحها أو حذفها: ${s.email}.`,
            }),
          ],
        },
      ]}
    />
  );
}
