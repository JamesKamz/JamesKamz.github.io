import { BrandIcon } from "@/components/icons/BrandIcon";
import type { Brand } from "@/components/icons/brand-paths";
import type { SettingsView } from "@/lib/types";
import { cn, whatsappUrl } from "@/lib/utils";

const order: { key: keyof SettingsView; brand: Brand; label: string }[] = [
  { key: "linkedin", brand: "linkedin", label: "LinkedIn" },
  { key: "github", brand: "github", label: "GitHub" },
  { key: "youtube", brand: "youtube", label: "YouTube" },
  { key: "comeup", brand: "comeup", label: "ComeUp" },
  { key: "upwork", brand: "upwork", label: "Upwork" },
  { key: "facebook", brand: "facebook", label: "Facebook" },
  { key: "instagram", brand: "instagram", label: "Instagram" },
  { key: "whatsapp", brand: "whatsapp", label: "WhatsApp" },
];

export function SocialLinks({ settings, className }: { settings: SettingsView; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {order.map(({ key, brand, label }) => {
        const raw = settings[key];
        if (typeof raw !== "string" || !raw) return null;
        const href = key === "whatsapp" ? whatsappUrl(raw) : raw;
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={label}
              title={label}
              className="grid size-10 place-items-center rounded-full border border-line text-fg-soft transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <BrandIcon brand={brand} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
