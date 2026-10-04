import { z } from "zod";
import { defaultPricing, type PricingConfig } from "./pricing";

export * from "./pricing";

// No runtime code generation (new Function) — keeps the strict CSP clean in the browser.
z.config({ jitless: true });

const labelled = {
  key: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
  labelFr: z.string().min(1).max(80),
  labelEn: z.string().min(1).max(80),
};

export const pricingSchema = z.object({
  /** Amount of each currency for 1 EUR. */
  rates: z.object({
    EUR: z.literal(1),
    MAD: z.number().positive(),
    USD: z.number().positive(),
  }),
  /** Width of the range around the central estimate (0.2 → ±20%). */
  spread: z.number().min(0).max(0.9),
  projectTypes: z.array(z.object({ ...labelled, base: z.number().min(0) })).min(1),
  features: z.array(z.object({ ...labelled, cost: z.number().min(0) })),
  timelines: z.array(z.object({ ...labelled, multiplier: z.number().positive().max(5) })).min(1),
  designLevels: z.array(z.object({ ...labelled, multiplier: z.number().positive().max(5) })).min(1),
});

// Compile-time check that the schema matches the PricingConfig type.
const _pricingTypeCheck: PricingConfig = {} as z.infer<typeof pricingSchema>;
void _pricingTypeCheck;

export const estimateInputSchema = z.object({
  projectType: z.string().min(1),
  features: z.array(z.string()).max(30).default([]),
  timeline: z.string().min(1),
  design: z.string().min(1),
});


/** Parse pricing JSON coming from the database, falling back to defaults. */
export function parsePricing(raw: unknown): PricingConfig {
  const parsed = pricingSchema.safeParse(raw);
  return parsed.success ? parsed.data : defaultPricing;
}
