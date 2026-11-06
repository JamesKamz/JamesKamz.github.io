import { NextResponse } from "next/server";
import { guardedJson, jsonError } from "@/lib/api";
import { getDb } from "@/lib/db";
import { notifyOwner, renderEmail } from "@/lib/mail";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await guardedJson(request, contactSchema, { bucket: "contact", limit: 5, windowMs: 10 * 60_000 });
  if (guard instanceof NextResponse) return guard;
  const { data } = guard;

  // Honeypot filled → pretend success, store nothing.
  if (data.website) return NextResponse.json({ ok: true });

  const db = getDb();
  let stored = false;
  if (db) {
    try {
      await db.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          budget: data.budget,
          locale: data.locale,
        },
      });
      stored = true;
    } catch (error) {
      console.error("[contact] db error:", (error as Error).message);
    }
  }

  const mailed = await notifyOwner({
    subject: `[Portfolio] ${data.subject}`,
    replyTo: data.email,
    html: renderEmail("Nouveau message de contact", [
      ["Nom", data.name],
      ["Email", data.email],
      ["Téléphone", data.phone],
      ["Budget", data.budget],
      ["Langue", data.locale],
      ["Sujet", data.subject],
      ["Message", data.message],
    ]),
  });

  if (!stored && !mailed && process.env.NODE_ENV === "production") {
    return jsonError(503, "unavailable");
  }
  return NextResponse.json({ ok: true });
}
