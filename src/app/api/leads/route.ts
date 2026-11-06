import { NextResponse } from "next/server";
import { guardedJson, jsonError } from "@/lib/api";
import { computeEstimate, EstimateError, formatMoney } from "@/lib/budget";
import { getPricing } from "@/lib/content";
import { getDb } from "@/lib/db";
import { notifyOwner, renderEmail } from "@/lib/mail";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await guardedJson(request, leadSchema, { bucket: "lead", limit: 5, windowMs: 10 * 60_000 });
  if (guard instanceof NextResponse) return guard;
  const { data } = guard;
  if (data.website) return NextResponse.json({ ok: true });

  // Never trust a client-side estimate: recompute from the current pricing.
  const pricing = await getPricing();
  let estimate;
  try {
    estimate = computeEstimate(pricing, data);
  } catch (error) {
    if (error instanceof EstimateError) return jsonError(422, "validation", { issues: [{ path: "estimate", message: error.message }] });
    throw error;
  }
  const eur = estimate.ranges.EUR;

  const db = getDb();
  let stored = false;
  if (db) {
    try {
      await db.lead.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          message: data.message,
          locale: data.locale,
          source: "BUDGET",
          projectType: data.projectType,
          features: data.features,
          timeline: data.timeline,
          design: data.design,
          estimateMin: eur.min,
          estimateMax: eur.max,
          title: pricing.projectTypes.find((t) => t.key === data.projectType)?.labelFr ?? data.projectType,
        },
      });
      stored = true;
    } catch (error) {
      console.error("[leads] db error:", (error as Error).message);
    }
  }

  const label = (list: { key: string; labelFr: string }[], key: string) => list.find((i) => i.key === key)?.labelFr ?? key;
  const mailed = await notifyOwner({
    subject: `[Portfolio] Nouvelle demande de devis — ${data.name}`,
    replyTo: data.email,
    html: renderEmail("Nouvelle demande via l'estimateur", [
      ["Nom", data.name],
      ["Email", data.email],
      ["Téléphone", data.phone],
      ["Entreprise", data.company],
      ["Type", label(pricing.projectTypes, data.projectType)],
      ["Fonctionnalités", data.features.map((f) => label(pricing.features, f)).join(", ")],
      ["Délai", label(pricing.timelines, data.timeline)],
      ["Design", label(pricing.designLevels, data.design)],
      ["Estimation", `${formatMoney(eur.min, "EUR", "fr")} – ${formatMoney(eur.max, "EUR", "fr")}`],
      ["Message", data.message],
    ]),
  });

  if (!stored && !mailed && process.env.NODE_ENV === "production") return jsonError(503, "unavailable");
  return NextResponse.json({ ok: true, estimate: estimate.ranges });
}
