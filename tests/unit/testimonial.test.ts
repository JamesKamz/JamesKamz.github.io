import { describe, expect, it } from "vitest";
import { testimonialSubmitSchema } from "@/lib/validation";

const valid = {
  token: "a".repeat(32),
  name: "Awa Diallo",
  rating: "5",
  message: "Travail rapide et soigné, la boutique a été livrée à temps.",
  consent: true,
  locale: "fr",
};

describe("testimonialSubmitSchema", () => {
  it("accepts a complete submission and normalises optional fields", () => {
    const r = testimonialSubmitSchema.safeParse({ ...valid, role: "", email: " Awa@Example.com ", website: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.rating).toBe(5);
      expect(r.data.role).toBeUndefined();
      expect(r.data.email).toBe("awa@example.com");
    }
  });

  it("requires consent to publish", () => {
    expect(testimonialSubmitSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    const { consent: _c, ...noConsent } = valid;
    expect(testimonialSubmitSchema.safeParse(noConsent).success).toBe(false);
  });

  it("rejects ratings outside 1–5, short messages and bad emails", () => {
    expect(testimonialSubmitSchema.safeParse({ ...valid, rating: "0" }).success).toBe(false);
    expect(testimonialSubmitSchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
    expect(testimonialSubmitSchema.safeParse({ ...valid, rating: undefined }).success).toBe(false);
    expect(testimonialSubmitSchema.safeParse({ ...valid, message: "Super !" }).success).toBe(false);
    expect(testimonialSubmitSchema.safeParse({ ...valid, email: "pas-un-mail" }).success).toBe(false);
  });

  it("rejects a missing or too short token", () => {
    expect(testimonialSubmitSchema.safeParse({ ...valid, token: "abc" }).success).toBe(false);
  });
});
