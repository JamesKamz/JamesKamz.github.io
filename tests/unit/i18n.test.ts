import { describe, expect, it } from "vitest";
import { optionLabel } from "@/lib/pricing";
import { intlLocale, loc, locList } from "@/lib/types";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const keys = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

describe("messages", () => {
  it("every locale has exactly the French keys", () => {
    expect(keys(en).sort()).toEqual(keys(fr).sort());
    expect(keys(ar).sort()).toEqual(keys(fr).sort());
  });
});

describe("loc", () => {
  const row = { titleFr: "Bonjour", titleEn: "Hello", titleAr: "", tagsFr: ["a"], tagsEn: ["b"], tagsAr: [] as string[] };

  it("picks the requested locale", () => {
    expect(loc(row, "title", "fr")).toBe("Bonjour");
    expect(loc(row, "title", "en")).toBe("Hello");
    expect(loc({ ...row, titleAr: "مرحبا" }, "title", "ar")).toBe("مرحبا");
  });

  it("falls back to English for empty or missing Arabic", () => {
    expect(loc(row, "title", "ar")).toBe("Hello");
    expect(loc({ titleFr: "Bonjour", titleEn: "Hello" }, "title", "ar")).toBe("Hello");
    expect(locList(row, "tags", "ar")).toEqual(["b"]);
  });

  it("falls back to French when English is empty", () => {
    expect(loc({ titleFr: "Bonjour", titleEn: " " }, "title", "en")).toBe("Bonjour");
  });
});

describe("helpers", () => {
  it("optionLabel falls back to English for Arabic", () => {
    expect(optionLabel({ key: "k", labelFr: "Site", labelEn: "Website" }, "ar")).toBe("Website");
    expect(optionLabel({ key: "k", labelFr: "Site", labelEn: "Website", labelAr: "موقع" }, "ar")).toBe("موقع");
  });

  it("intlLocale keeps Latin digits for Arabic", () => {
    expect(new Intl.NumberFormat(intlLocale("ar")).format(1234)).toMatch(/^1.?234$/);
  });
});
