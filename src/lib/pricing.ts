/**
 * Budget estimator — pure pricing logic (no dependencies, safe for client bundles).
 * Shared by the public wizard, the API route (server-side recomputation) and the admin.
 * All prices are expressed in the base currency (EUR).
 */

import { intlLocale } from "./types";

/** Every currency an estimate is computed in. EUR is the internal base (admin, stored leads). */
export const CURRENCIES = ["EUR", "USD", "MAD", "XOF"] as const;
export type Currency = (typeof CURRENCIES)[number];
/** Currencies quoted to visitors — no EUR on the public side. */
export const DISPLAY_CURRENCIES = ["USD", "MAD", "XOF"] as const satisfies readonly Currency[];
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];
/** Fixed CFA franc peg. */
export const XOF_PER_EUR = 655.957;

// UEMOA countries and their West African neighbours share the CFA quote.
const WEST_AFRICA_TZ = new Set([
  "Africa/Abidjan", "Africa/Accra", "Africa/Bamako", "Africa/Banjul", "Africa/Bissau", "Africa/Conakry", "Africa/Dakar",
  "Africa/Freetown", "Africa/Lagos", "Africa/Lome", "Africa/Monrovia", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo",
]);

/**
 * Quote currency for a visitor: Morocco → MAD, West Africa → CFA franc, everyone else (Europe included) → USD.
 * shortcut: guessed from the browser time zone (works with cached pages and locally); switch to the edge geo header if precision matters.
 */
export function currencyForTimeZone(timeZone: string | undefined): DisplayCurrency {
  if (timeZone === "Africa/Casablanca" || timeZone === "Africa/El_Aaiun") return "MAD";
  if (timeZone && WEST_AFRICA_TZ.has(timeZone)) return "XOF";
  return "USD";
}

type Labelled = { key: string; labelFr: string; labelEn: string; labelAr?: string };

/** Localized option label; Arabic falls back to English. */
export function optionLabel(option: Labelled, locale: string): string {
  if (locale === "ar") return option.labelAr || option.labelEn;
  return locale === "en" ? option.labelEn : option.labelFr;
}

export type PricingConfig = {
  /** Amount of each currency for 1 EUR. */
  rates: { EUR: 1; MAD: number; USD: number; XOF: number };
  /** Width of the range around the central estimate (0.2 → ±20%). */
  spread: number;
  projectTypes: (Labelled & { base: number })[];
  features: (Labelled & { cost: number })[];
  timelines: (Labelled & { multiplier: number })[];
  designLevels: (Labelled & { multiplier: number })[];
};

export type EstimateInput = { projectType: string; features: string[]; timeline: string; design: string };

export type Range = { min: number; max: number };
export type Estimate = {
  /** Central estimate in EUR before applying the spread. */
  central: number;
  ranges: Record<Currency, Range>;
};

export class EstimateError extends Error {}

/** Round to a "friendly" step depending on the magnitude/currency. */
export function roundFriendly(value: number, currency: Currency): number {
  const step =
    currency === "XOF" ? (value >= 1_000_000 ? 50_000 : 10_000) : currency === "MAD" ? (value >= 20000 ? 500 : 100) : value >= 2000 ? 50 : 10;
  return Math.max(step, Math.round(value / step) * step);
}

export function computeEstimate(pricing: PricingConfig, input: EstimateInput): Estimate {
  const type = pricing.projectTypes.find((t) => t.key === input.projectType);
  if (!type) throw new EstimateError(`Unknown project type: ${input.projectType}`);
  const timeline = pricing.timelines.find((t) => t.key === input.timeline);
  if (!timeline) throw new EstimateError(`Unknown timeline: ${input.timeline}`);
  const design = pricing.designLevels.find((d) => d.key === input.design);
  if (!design) throw new EstimateError(`Unknown design level: ${input.design}`);

  const uniqueFeatures = Array.from(new Set(input.features));
  const featuresCost = uniqueFeatures.reduce((sum, key) => {
    const feature = pricing.features.find((f) => f.key === key);
    if (!feature) throw new EstimateError(`Unknown feature: ${key}`);
    return sum + feature.cost;
  }, 0);

  const central = (type.base + featuresCost) * timeline.multiplier * design.multiplier;

  const ranges = {} as Record<Currency, Range>;
  for (const currency of CURRENCIES) {
    const rate = pricing.rates[currency];
    const min = roundFriendly(central * (1 - pricing.spread) * rate, currency);
    const max = roundFriendly(central * (1 + pricing.spread) * rate, currency);
    ranges[currency] = { min, max: Math.max(min, max) };
  }
  return { central: Math.round(central), ranges };
}

export function formatMoney(value: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const defaultPricing: PricingConfig = {
  rates: { EUR: 1, MAD: 10.8, USD: 1.08, XOF: XOF_PER_EUR },
  spread: 0.2,
  projectTypes: [
    { key: "saas", labelFr: "SaaS sur mesure (MVP → production)", labelEn: "Custom SaaS (MVP → production)", base: 4500 },
    { key: "webapp", labelFr: "Application web métier", labelEn: "Business web application", base: 2500 },
    { key: "ecommerce", labelFr: "E-commerce / marketplace", labelEn: "E-commerce / marketplace", base: 1800 },
    { key: "showcase", labelFr: "Site vitrine", labelEn: "Showcase website", base: 700 },
    { key: "odoo", labelFr: "Projet Odoo (intégration, modules, migration)", labelEn: "Odoo project (integration, modules, migration)", base: 2000 },
    { key: "automation", labelFr: "Automatisation de processus", labelEn: "Process automation", base: 600 },
    { key: "api", labelFr: "API & backend", labelEn: "API & backend", base: 1500 },
    { key: "wordpress", labelFr: "WordPress & sécurité", labelEn: "WordPress & security", base: 500 },
  ],
  features: [
    { key: "auth", labelFr: "Comptes utilisateurs & rôles", labelEn: "User accounts & roles", cost: 300 },
    { key: "payments", labelFr: "Paiement en ligne", labelEn: "Online payments", cost: 500 },
    { key: "subscriptions", labelFr: "Abonnements / facturation récurrente", labelEn: "Subscriptions / recurring billing", cost: 700 },
    { key: "admin", labelFr: "Dashboard d'administration", labelEn: "Admin dashboard", cost: 700 },
    { key: "multilang", labelFr: "Multilingue", labelEn: "Multilingual", cost: 300 },
    { key: "ai", labelFr: "Intégration IA (chatbot, génération…)", labelEn: "AI integration (chatbot, generation…)", cost: 800 },
    { key: "integrations", labelFr: "Intégrations API tierces", labelEn: "Third-party API integrations", cost: 500 },
    { key: "notifications", labelFr: "Emails & notifications", labelEn: "Emails & notifications", cost: 250 },
    { key: "analytics", labelFr: "Statistiques & reporting", labelEn: "Analytics & reporting", cost: 400 },
    { key: "uploads", labelFr: "Gestion de fichiers / médias", labelEn: "File & media management", cost: 250 },
    { key: "realtime", labelFr: "Temps réel (chat, live)", labelEn: "Real-time (chat, live)", cost: 600 },
    { key: "booking", labelFr: "Réservation / agenda", labelEn: "Booking / calendar", cost: 450 },
  ],
  timelines: [
    { key: "urgent", labelFr: "Urgent (moins d'un mois)", labelEn: "Urgent (under a month)", multiplier: 1.3 },
    { key: "standard", labelFr: "Standard (1 à 3 mois)", labelEn: "Standard (1–3 months)", multiplier: 1 },
    { key: "flexible", labelFr: "Flexible (plus de 3 mois)", labelEn: "Flexible (3+ months)", multiplier: 0.9 },
  ],
  designLevels: [
    { key: "template", labelFr: "Basé sur un thème existant", labelEn: "Based on an existing theme", multiplier: 0.85 },
    { key: "custom", labelFr: "Design sur mesure", labelEn: "Custom design", multiplier: 1 },
    { key: "premium", labelFr: "Premium (identité forte, animations)", labelEn: "Premium (strong identity, motion)", multiplier: 1.3 },
  ],
};

