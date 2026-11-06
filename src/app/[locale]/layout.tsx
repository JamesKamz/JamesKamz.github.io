import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LazyCursor } from "@/components/site/LazyCursor";
import { PageViewTracker } from "@/components/site/PageViewTracker";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { Providers } from "@/components/site/Providers";
import { ThemeScript } from "@/components/site/ThemeScript";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { alternates, OG_LOCALES } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { absoluteUrl, SITE_URL } from "@/lib/utils";

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
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
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
      url: absoluteUrl(locale === routing.defaultLocale ? "/" : `/${locale}`),
      locale: OG_LOCALES[locale as Locale],
      alternateLocale: Object.entries(OG_LOCALES).filter(([l]) => l !== locale).map(([, og]) => og),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
    // Search Console ownership: set GOOGLE_SITE_VERIFICATION to the content of Google's meta tag.
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const settings = await getSettings();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} data-theme="dark" data-scroll-behavior="smooth" className={fontVariables} suppressHydrationWarning>
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
            <PageViewTracker />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
