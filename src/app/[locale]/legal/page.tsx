import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { loc, type Locale } from "@/lib/types";

export const revalidate = 3600;

const TITLE = { fr: "Mentions légales", en: "Legal notice", ar: "الإشعار القانوني" };

export async function generateMetadata({ params }: PageProps<"/[locale]/legal">): Promise<Metadata> {
  const { locale } = await params;
  const { fullName } = await getSettings();
  return pageMetadata({ title: TITLE[locale as Locale], description: `${TITLE[locale as Locale]} — ${fullName}`, href: "/legal", locale, index: false });
}

export default async function Legal({ params }: PageProps<"/[locale]/legal">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const s = await getSettings();
  const t = (text: Record<Locale, string>) => text[locale as Locale];
  return (
    <LegalPage
      title={TITLE[locale as Locale]}
      updated={t({ fr: "Dernière mise à jour : octobre 2026", en: "Last updated: October 2026", ar: "آخر تحديث: أكتوبر 2026" })}
      sections={[
        {
          h: t({ fr: "Éditeur du site", en: "Publisher", ar: "ناشر الموقع" }),
          p: [
            `${s.fullName} (${s.alias}) — ${t({ fr: "développeur indépendant", en: "independent developer", ar: "مطوّر مستقل" })}${locale === "ar" ? "،" : ","} ${loc(s, "location", locale)}.`,
            `${t({ fr: "Contact", en: "Contact", ar: "التواصل" })} : ${s.email}`,
          ],
        },
        {
          h: t({ fr: "Hébergement", en: "Hosting", ar: "الاستضافة" }),
          p: ["Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com"],
        },
        {
          h: t({ fr: "Propriété intellectuelle", en: "Intellectual property", ar: "الملكية الفكرية" }),
          p: [
            t({
              fr: "L'ensemble des contenus de ce site (textes, visuels, code) est la propriété de son auteur, sauf mention contraire. Les captures de projets appartiennent à leurs propriétaires respectifs et sont présentées à titre de références.",
              en: "All content on this site (texts, visuals, code) is the property of its author unless otherwise stated. Project screenshots belong to their respective owners and are shown as portfolio references.",
              ar: "جميع محتويات هذا الموقع (النصوص والمرئيات والشيفرة) ملك لصاحبه ما لم يُذكر خلاف ذلك. لقطات المشاريع ملك لأصحابها وتُعرض كمراجع ضمن معرض الأعمال.",
            }),
          ],
        },
        {
          h: t({ fr: "Responsabilité", en: "Liability", ar: "المسؤولية" }),
          p: [
            t({
              fr: "Les estimations de budget et les réponses du chatbot sont indicatives et non contractuelles. Seul un devis signé engage les parties.",
              en: "Budget estimates and chatbot answers are indicative and non-binding. Only a signed quote is contractual.",
              ar: "تقديرات الميزانية وإجابات المساعد الذكي إرشادية وغير مُلزمة. وحده عرض السعر الموقَّع يُلزم الطرفين.",
            }),
          ],
        },
      ]}
    />
  );
}
