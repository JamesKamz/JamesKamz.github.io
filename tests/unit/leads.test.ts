import { describe, expect, it } from "vitest";
import type { Lead } from "@/generated/prisma/client";
import { leadAmount, monthlyTotals, remaining, totalsByStatus } from "@/lib/admin/leads";

const base = (patch: Partial<Lead>): Lead => ({
  id: Math.random().toString(36),
  name: "x",
  email: "x@example.com",
  phone: null,
  company: null,
  title: null,
  message: null,
  source: "BUDGET",
  locale: "fr",
  projectType: null,
  features: [],
  timeline: null,
  design: null,
  estimateMin: null,
  estimateMax: null,
  budgetValidated: null,
  amountPaid: 0,
  status: "NEW",
  notes: null,
  startDate: null,
  dueDate: null,
  createdAt: new Date("2026-09-15"),
  updatedAt: new Date("2026-09-15"),
  ...patch,
});

describe("lead budgets", () => {
  it("uses the validated budget, else the estimate midpoint", () => {
    expect(leadAmount(base({ budgetValidated: 3000, estimateMin: 1000, estimateMax: 2000 }))).toBe(3000);
    expect(leadAmount(base({ estimateMin: 1000, estimateMax: 2000 }))).toBe(1500);
    expect(leadAmount(base({}))).toBe(0);
  });
  it("computes the remaining amount", () => {
    expect(remaining(base({ budgetValidated: 3000, amountPaid: 1200 }))).toBe(1800);
    expect(remaining(base({ budgetValidated: 1000, amountPaid: 1500 }))).toBe(0);
    expect(remaining(base({}))).toBeNull();
  });
  it("aggregates totals by status and month (excluding lost)", () => {
    const leads = [
      base({ status: "IN_PROGRESS", budgetValidated: 4000, amountPaid: 2000 }),
      base({ status: "IN_PROGRESS", budgetValidated: 1000 }),
      base({ status: "LOST", budgetValidated: 9000 }),
    ];
    const byStatus = totalsByStatus(leads).find((t) => t.status === "IN_PROGRESS")!;
    expect(byStatus).toMatchObject({ count: 2, amount: 5000, paid: 2000 });
    const months = monthlyTotals(leads, 3, new Date("2026-10-04"));
    expect(months).toHaveLength(3);
    expect(months[1]).toMatchObject({ value: 5000, count: 2 }); // September
  });
});
