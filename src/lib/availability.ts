/**
 * James's meeting availability (pure, no dependencies).
 * Unavailable every week from Friday 18:00 GMT to Saturday 18:00 GMT; available the rest of the time.
 */
export const MEETING_MINUTES = 30;
const MAX_DAYS_AHEAD = 60;
const MIN_NOTICE_MS = 2 * 60 * 60_000;

/** True when the instant falls inside the weekly Friday 18:00 → Saturday 18:00 GMT break. */
function inWeeklyBreak(date: Date): boolean {
  const day = date.getUTCDay(); // 5 = Friday, 6 = Saturday
  const hour = date.getUTCHours();
  return (day === 5 && hour >= 18) || (day === 6 && hour < 18);
}

export type SlotCheck = { ok: true } | { ok: false; reason: "past" | "too_far" | "unavailable" };

export function checkSlot(start: Date, now: Date = new Date()): SlotCheck {
  if (start.getTime() < now.getTime() + MIN_NOTICE_MS) return { ok: false, reason: "past" };
  if (start.getTime() > now.getTime() + MAX_DAYS_AHEAD * 864e5) return { ok: false, reason: "too_far" };
  // The break lasts 24 h, longer than a meeting, so checking both ends catches any overlap.
  const end = new Date(start.getTime() + MEETING_MINUTES * 60_000 - 1);
  if (inWeeklyBreak(start) || inWeeklyBreak(end)) return { ok: false, reason: "unavailable" };
  return { ok: true };
}
