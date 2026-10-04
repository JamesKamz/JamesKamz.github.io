import { useTranslations } from "next-intl";
import { Zellige } from "@/components/site/Zellige";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="relative isolate grid min-h-[80dvh] place-items-center overflow-hidden px-4 pt-24">
      <Zellige id="zellige-404" className="-z-10 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="card w-full max-w-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-muted">bash — 404</span>
        </div>
        <div className="p-6 font-mono text-sm sm:p-8">
          <p>
            <span className="text-accent-2">$</span> cd ./page
          </p>
          <p className="mt-1 text-danger">bash: cd: ./page: No such file or directory</p>
          <h1 className="mt-8 font-display text-6xl font-semibold sm:text-8xl">
            404<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 font-sans text-lg font-semibold">{t("title")}</p>
          <p className="mt-2 font-sans text-fg-soft">{t("text")}</p>
          <p className="mt-6">
            <span className="text-accent-2">$</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" aria-hidden />
          </p>
          <Link href="/" className={buttonClass("primary", "mt-6 font-sans")}>
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
