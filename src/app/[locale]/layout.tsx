import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LazyCursor } from "@/components/site/LazyCursor";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { Providers } from "@/components/site/Providers";
import { ThemeScript } from "@/components/site/ThemeScript";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { alternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "fr" | "en", namespace: "meta" });
  const settings = await getSettings();
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${settings.alias}` },
    description,
    keywords: t("keywords").split(",").map((k) => k.trim()),
    authors: [{ name: `${settings.fullName} (${settings.alias})`, url: SITE_URL }],
    creator: settings.alias,
    alternates: alternates("/", locale),
    openGraph: {
      type: "website",
      siteName: settings.alias,
      title,
      description,
      locale: locale === "en" ? "en_US" : "fr_FR",
      alternateLocale: locale === "en" ? ["fr_FR"] : ["en_US"],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const settings = await getSettings();

  return (
    <html lang={locale} data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <JsonLd settings={settings} locale={locale} />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="grain min-h-dvh overflow-x-hidden">
        <NextIntlClientProvider>
          <Providers>
            <Header alias={settings.alias} />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer settings={settings} />
            {settings.chatbotEnabled ? <ChatWidget /> : null}
            <LazyCursor />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
