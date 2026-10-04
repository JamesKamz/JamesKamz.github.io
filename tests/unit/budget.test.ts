import { describe, expect, it } from "vitest";
import {
  computeEstimate,
  defaultPricing,
  EstimateError,
  parsePricing,
  pricingSchema,
  roundFriendly,
  type PricingConfig,
} from "@/lib/budget";

const pricing: PricingConfig = {
  rates: { EUR: 1, MAD: 10, USD: 1.1 },
  spread: 0.2,
  projectTypes: [{ key: "saas", labelFr: "SaaS", labelEn: "SaaS", base: 4000 }],
  features: [
    { key: "auth", labelFr: "Auth", labelEn: "Auth", cost: 500 },
    { key: "pay", labelFr: "Paiement", labelEn: "Payments", cost: 500 },
  ],
  timelines: [
    { key: "standard", labelFr: "Standard", labelEn: "Standard", multiplier: 1 },
    { key: "urgent", labelFr: "Urgent", labelEn: "Urgent", multiplier: 1.5 },
  ],
  designLevels: [
    { key: "custom", labelFr: "Sur mesure", labelEn: "Custom", multiplier: 1 },
    { key: "premium", labelFr: "Premium", labelEn: "Premium", multiplier: 1.2 },
  ],
};

describe("computeEstimate", () => {
  it("adds base + features and applies the spread", () => {
    const e = computeEstimate(pricing, { projectType: "saas", features: ["auth", "pay"], timeline: "standard", design: "custom" });
    expect(e.central).toBe(5000);
    expect(e.ranges.EUR).toEqual({ min: 4000, max: 6000 });
  });

  it("applies timeline and design multipliers", () => {
    const e = computeEstimate(pricing, { projectType: "saas", features: [], timeline: "urgent", design: "premium" });
    expect(e.central).toBe(7200); // 4000 × 1.5 × 1.2
    expect(e.ranges.EUR).toEqual({ min: 5750, max: 8650 }); // 5760 → 5750, 8640 → 8650
  });

  it("converts to MAD and USD with friendly rounding", () => {
    const e = computeEstimate(pricing, { projectType: "saas", features: ["auth", "pay"], timeline: "standard", design: "custom" });
    expect(e.ranges.MAD).toEqual({ min: 40000, max: 60000 });
    expect(e.ranges.USD).toEqual({ min: 4400, max: 6600 });
  });

  it("counts a duplicated feature once", () => {
    const e = computeEstimate(pricing, { projectType: "saas", features: ["auth", "auth"], timeline: "standard", design: "custom" });
    expect(e.central).toBe(4500);
  });

  it("rejects unknown keys", () => {
    expect(() => computeEstimate(pricing, { projectType: "nope", features: [], timeline: "standard", design: "custom" })).toThrow(EstimateError);
    expect(() => computeEstimate(pricing, { projectType: "saas", features: ["x"], timeline: "standard", design: "custom" })).toThrow(EstimateError);
    expect(() => computeEstimate(pricing, { projectType: "saas", features: [], timeline: "x", design: "custom" })).toThrow(EstimateError);
    expect(() => computeEstimate(pricing, { projectType: "saas", features: [], timeline: "standard", design: "x" })).toThrow(EstimateError);
  });

  it("always returns min ≤ max", () => {
    const zeroSpread = { ...pricing, spread: 0 };
    const e = computeEstimate(zeroSpread, { projectType: "saas", features: [], timeline: "standard", design: "custom" });
    expect(e.ranges.EUR.min).toBeLessThanOrEqual(e.ranges.EUR.max);
  });
});

describe("roundFriendly", () => {
  it("uses currency-dependent steps", () => {
    expect(roundFriendly(1234, "EUR")).toBe(1230);
    expect(roundFriendly(2345, "EUR")).toBe(2350);
    expect(roundFriendly(12345, "MAD")).toBe(12300);
    expect(roundFriendly(43210, "MAD")).toBe(43000);
  });
  it("never returns zero", () => {
    expect(roundFriendly(1, "EUR")).toBe(10);
  });
});

describe("pricing config", () => {
  it("default pricing is valid", () => {
    expect(pricingSchema.safeParse(defaultPricing).success).toBe(true);
  });
  it("falls back to defaults on invalid JSON", () => {
    expect(parsePricing({ foo: "bar" })).toEqual(defaultPricing);
    expect(parsePricing(pricing)).toEqual(pricing);
  });
  it("rejects negative prices and bad keys", () => {
    const bad = { ...pricing, projectTypes: [{ key: "Bad Key", labelFr: "x", labelEn: "x", base: -1 }] };
    expect(pricingSchema.safeParse(bad).success).toBe(false);
  });
});
