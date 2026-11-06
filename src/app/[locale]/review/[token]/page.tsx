import { CheckCircle2, LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import type { Locale } from "@/lib/types";

// Personal invite links: always read fresh, never indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/review/[token]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "review" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function ReviewPage({ params }: PageProps<"/[locale]/review/[token]">) {
  const { locale, token } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("review");
  const invite = await getDb()
    ?.testimonialInvite.findUnique({ where: { token } })
    .catch(() => null);

  const state = !invite || invite.expiresAt < new Date() ? "invalid" : invite.usedAt ? "used" : "open";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      {state === "open" ? (
        <>
          <SectionHeading as="h1" kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
          {invite?.name ? <p className="mt-6 text-lg text-fg">{t("hello", { name: invite.name })}</p> : null}
          <div className="mt-10">
            <ReviewForm token={token} name={invite?.name ?? ""} project={invite?.project ?? ""} />
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-start gap-4 p-8">
          {state === "used" ? <CheckCircle2 className="size-10 text-accent-2" aria-hidden /> : <LinkIcon className="size-10 text-muted" aria-hidden />}
          <h1 className="font-display text-2xl font-semibold">{state === "used" ? t("usedTitle") : t("invalidTitle")}</h1>
          <p className="text-fg-soft">{state === "used" ? t("usedText") : t("invalidText")}</p>
          <Link href="/" className={buttonClass("secondary", "px-4 py-2.5")}>{t("home")}</Link>
        </div>
      )}
    </div>
  );
}
