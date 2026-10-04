import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SettingsView } from "@/lib/types";
import { SocialLinks } from "./SocialLinks";
import { Zellige } from "./Zellige";

export async function Footer({ settings }: { settings: SettingsView }) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-bg-elev">
      <Zellige id="zellige-footer" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
              {settings.alias}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-3 font-mono text-sm text-muted">{t("tagline")}</p>
            <a href={`mailto:${settings.email}`} className="mt-6 inline-block text-lg text-fg-soft underline decoration-accent/50 underline-offset-4 hover:text-accent">
              {settings.email}
            </a>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-fg-soft">
            <Link className="hover:text-accent" href="/projects">{tn("projects")}</Link>
            <Link className="hover:text-accent" href="/about">{tn("about")}</Link>
            <Link className="hover:text-accent" href="/budget">{tn("budget")}</Link>
            <Link className="hover:text-accent" href="/contact">{tn("contact")}</Link>
            <Link className="hover:text-accent" href="/legal">{t("legal")}</Link>
            <Link className="hover:text-accent" href="/privacy">{t("privacy")}</Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <SocialLinks settings={settings} />
          <p className="font-mono text-xs text-muted">
            © {year} {settings.fullName} — {t("rights")} {t("built")}
          </p>
        </div>
      </div>
    </footer>
  );
}
