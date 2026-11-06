import { describe, expect, it } from "vitest";
import { checkSlot } from "@/lib/availability";

// Wednesday 2026-11-04 12:00 GMT
const now = new Date("2026-11-04T12:00:00Z");

describe("checkSlot", () => {
  it("accepts weekday slots and Saturday evening", () => {
    expect(checkSlot(new Date("2026-11-05T10:00:00Z"), now)).toEqual({ ok: true }); // Thursday
    expect(checkSlot(new Date("2026-11-06T17:00:00Z"), now)).toEqual({ ok: true }); // Friday 17:00, ends 17:30
    expect(checkSlot(new Date("2026-11-07T18:00:00Z"), now)).toEqual({ ok: true }); // Saturday 18:00
    expect(checkSlot(new Date("2026-11-08T09:00:00Z"), now)).toEqual({ ok: true }); // Sunday
  });

  it("refuses the Friday 18:00 → Saturday 18:00 GMT break, including overlaps", () => {
    expect(checkSlot(new Date("2026-11-06T18:00:00Z"), now)).toEqual({ ok: false, reason: "unavailable" });
    expect(checkSlot(new Date("2026-11-06T17:45:00Z"), now)).toEqual({ ok: false, reason: "unavailable" }); // ends inside
    expect(checkSlot(new Date("2026-11-07T10:00:00Z"), now)).toEqual({ ok: false, reason: "unavailable" });
    expect(checkSlot(new Date("2026-11-07T17:45:00Z"), now)).toEqual({ ok: false, reason: "unavailable" });
  });

  it("honours the GMT offset of a local time", () => {
    // Friday 19:30 in Casablanca (GMT+1) is 18:30 GMT → inside the break
    expect(checkSlot(new Date("2026-11-06T19:30:00+01:00"), now).ok).toBe(false);
    // Friday 18:30 in Casablanca is 17:30 GMT → ends exactly at 18:00, allowed
    expect(checkSlot(new Date("2026-11-06T18:30:00+01:00"), now).ok).toBe(true);
  });

  it("refuses slots in the past, too soon, or too far ahead", () => {
    expect(checkSlot(new Date("2026-11-03T10:00:00Z"), now)).toEqual({ ok: false, reason: "past" });
    expect(checkSlot(new Date("2026-11-04T13:00:00Z"), now)).toEqual({ ok: false, reason: "past" });
    expect(checkSlot(new Date("2027-03-01T10:00:00Z"), now)).toEqual({ ok: false, reason: "too_far" });
  });
});
