import { NextResponse } from "next/server";
import { guardedJson, jsonError } from "@/lib/api";
import { getDb } from "@/lib/db";
import { notifyOwner, renderEmail } from "@/lib/mail";
import { testimonialSubmitSchema } from "@/lib/validation";

/** Testimonial sent through a single-use invite link; stored unpublished until reviewed in the admin. */
export async function POST(request: Request) {
  const guard = await guardedJson(request, testimonialSubmitSchema, { bucket: "testimonial", limit: 5, windowMs: 10 * 60_000 });
  if (guard instanceof NextResponse) return guard;
  const { data } = guard;

  // Honeypot filled → pretend success, store nothing.
  if (data.website) return NextResponse.json({ ok: true });

  const db = getDb();
  if (!db) return jsonError(503, "unavailable");

  const role = [data.role, data.company].filter(Boolean).join(", ") || null;
  let created;
  try {
    created = await db.$transaction(async (tx) => {
      const invite = await tx.testimonialInvite.findUnique({ where: { token: data.token } });
      if (!invite || invite.expiresAt < new Date()) return null;
      // Atomic claim: a second submission with the same link finds usedAt already set.
      const claimed = await tx.testimonialInvite.updateMany({ where: { id: invite.id, usedAt: null }, data: { usedAt: new Date() } });
      if (claimed.count === 0) return null;
      const testimonial = await tx.testimonial.create({
        data: {
          authorName: data.name,
          authorRole: role,
          country: data.country ?? null,
          project: data.project ?? null,
          email: data.email ?? invite.email ?? null,
          platform: "DIRECT",
          rating: data.rating,
          // The quote stays in the client's own words; other languages fall back to it.
          textFr: data.message,
          textEn: data.locale === "en" ? data.message : null,
          textAr: data.locale === "ar" ? data.message : null,
          published: false,
          order: 100,
        },
      });
      await tx.testimonialInvite.update({ where: { id: invite.id }, data: { testimonialId: testimonial.id } });
      return testimonial;
    });
  } catch (error) {
    console.error("[testimonials] db error:", (error as Error).message);
    return jsonError(503, "unavailable");
  }
  if (!created) return jsonError(410, "invalid_invite");

  await notifyOwner({
    subject: `[Portfolio] Nouveau témoignage de ${data.name}`,
    replyTo: data.email,
    html: renderEmail("Nouveau témoignage à relire", [
      ["Nom", data.name],
      ["Poste / entreprise", role ?? undefined],
      ["Pays", data.country],
      ["Projet", data.project],
      ["Note", `${data.rating}/5`],
      ["Langue", data.locale],
      ["Témoignage", data.message],
    ]),
  });

  return NextResponse.json({ ok: true });
}
