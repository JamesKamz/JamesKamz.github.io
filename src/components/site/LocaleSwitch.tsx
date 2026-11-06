"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const NAMES = { fr: "FR", en: "EN", ar: "عربي" } as const;

export function LocaleSwitch({ label }: { label: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={label} title={label} className="flex h-10 items-center rounded-full border border-line p-1 font-mono text-xs uppercase">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          disabled={pending || l === locale}
          aria-pressed={l === locale}
          onClick={() =>
            startTransition(() => {
              // pathname + params always match a configured route here
              router.replace({ pathname, params } as Parameters<typeof router.replace>[0], { locale: l });
            })
          }
          className={cn(
            "h-full min-w-8 rounded-full px-2 transition",
            l === locale ? "bg-surface-2 text-accent" : "text-fg-soft hover:text-accent disabled:opacity-50",
          )}
        >
          {NAMES[l]}
        </button>
      ))}
    </div>
  );
}
