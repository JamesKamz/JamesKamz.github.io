import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://jameskamz.com").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatNumber(value: number, locale: string, decimals = 0) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function compactNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Build a wa.me link from a phone number in any format. */
export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
