"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: { pathname: "/", hash: "services" }, key: "services" },
  { href: { pathname: "/projects" }, key: "projects" },
  { href: { pathname: "/about" }, key: "about" },
  { href: { pathname: "/budget" }, key: "budget" },
  { href: { pathname: "/contact" }, key: "contact" },
] as const;

export function Header({ alias }: { alias: string }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const [first, second] = alias.split(" ");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || open ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2 font-mono text-sm" onClick={() => setOpen(false)}>
          <span className="grid size-8 place-items-center rounded-lg bg-accent font-display text-base font-bold text-accent-fg transition group-hover:rotate-6">
            JK
          </span>
          <span className="hidden sm:inline">
            <span className="text-fg">{first?.toLowerCase()}</span>
            <span className="text-accent">.</span>
            <span className="text-muted">{second?.toLowerCase()}</span>
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent-2" aria-hidden />
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = link.href.pathname !== "/" && pathname.startsWith(link.href.pathname);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition hover:text-accent",
                  active ? "text-accent" : "text-fg-soft",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch label={t("language")} />
          <ThemeToggle label={t("theme")} />
          <Link href="/contact" className={buttonClass("primary", "hidden px-4 py-2.5 md:inline-flex")}>
            {tc("startProject")}
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <m.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-bg lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-6">
              {links.map((link, i) => (
                <m.li
                  key={link.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-3 border-b border-line py-4 font-display text-3xl font-semibold"
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    {t(link.key)}
                  </Link>
                </m.li>
              ))}
            </ul>
            <div className="px-4 pt-8">
              <Link href="/contact" onClick={() => setOpen(false)} className={buttonClass("primary", "w-full")}>
                {tc("startProject")}
              </Link>
            </div>
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
