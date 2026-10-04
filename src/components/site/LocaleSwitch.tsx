"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitch({ label }: { label: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();
  const next = locale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      disabled={pending}
      lang={next}
      title={label}
      onClick={() =>
        startTransition(() => {
          // pathname + params always match a configured route here
          router.replace({ pathname, params } as Parameters<typeof router.replace>[0], { locale: next });
        })
      }
      className="h-10 rounded-full border border-line px-3 font-mono text-xs uppercase tracking-wider text-fg-soft transition hover:border-accent hover:text-accent disabled:opacity-50"
    >
      <span className="sr-only">{label}: </span>
      <span className="text-accent">{locale}</span>
      <span className="mx-1 text-muted">/</span>
      {next}
    </button>
  );
}
