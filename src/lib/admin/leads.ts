import type { Lead, LeadStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  DISCUSSION: "En discussion",
  QUOTE_SENT: "Devis envoyé",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livré",
  LOST: "Perdu",
};

export const STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];

export const SOURCE_LABELS = { BUDGET: "Estimateur", CONTACT: "Contact", CHAT: "Chatbot", MANUAL: "Manuel" } as const;

/** The amount a lead "weighs": validated budget, else the middle of the estimate. */
export function leadAmount(lead: Pick<Lead, "budgetValidated" | "estimateMin" | "estimateMax">): number {
  if (lead.budgetValidated !== null) return lead.budgetValidated;
  if (lead.estimateMin !== null && lead.estimateMax !== null) return Math.round((lead.estimateMin + lead.estimateMax) / 2);
  return lead.estimateMax ?? lead.estimateMin ?? 0;
}

export function remaining(lead: Pick<Lead, "budgetValidated" | "amountPaid">): number | null {
  return lead.budgetValidated === null ? null : Math.max(0, lead.budgetValidated - lead.amountPaid);
}

export function totalsByStatus(leads: Lead[]) {
  return STATUSES.map((status) => {
    const items = leads.filter((l) => l.status === status);
    return {
      status,
      label: STATUS_LABELS[status],
      count: items.length,
      amount: items.reduce((s, l) => s + leadAmount(l), 0),
      paid: items.reduce((s, l) => s + l.amountPaid, 0),
    };
  });
}

/** Totals for the last `months` months (excluding lost leads), keyed by creation month. */
export function monthlyTotals(leads: Lead[], months = 12, now = new Date()) {
  const fmt = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const buckets: { key: string; label: string; value: number; count: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: fmt.format(d).replace(".", ""), value: 0, count: 0 });
  }
  for (const lead of leads) {
    if (lead.status === "LOST") continue;
    const d = new Date(lead.createdAt);
    const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) {
      bucket.value += leadAmount(lead);
      bucket.count += 1;
    }
  }
  return buckets.map(({ label, value, count }) => ({ label, value, count }));
}

export const eur = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export function daysAgo(days: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - days * 864e5);
}
