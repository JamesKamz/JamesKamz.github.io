import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { checkSlot, MEETING_MINUTES } from "./availability";
import { getDb } from "./db";
import { notifyOwner, renderEmail } from "./mail";
import { rateLimit } from "./rate-limit";

export const BOOK_TOOL_NAME = "book_appointment";

/** Tool given to the chatbot so visitors can request a call with James. */
export const bookAppointmentTool: Anthropic.Beta.BetaTool = {
  name: BOOK_TOOL_NAME,
  description:
    "Request a 30-minute video call between the visitor and James. Call it only after the visitor has given their name, email, the topic and a preferred date and time, and has confirmed the summary. James then contacts them to confirm. Returns ok with the slot in GMT, or an error code to explain to the visitor.",
  eager_input_streaming: true,
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Visitor's full name" },
      email: { type: "string", description: "Visitor's email address" },
      phone: { type: "string", description: "Phone or WhatsApp number, if given" },
      company: { type: "string", description: "Company, if given" },
      topic: { type: "string", description: "What the call is about, in a sentence or two" },
      start: {
        type: "string",
        description: "Requested start, ISO 8601 with the visitor's UTC offset, e.g. 2026-11-12T15:00:00+01:00",
      },
      visitor_timezone: { type: "string", description: "Visitor's time zone or city if known, e.g. Africa/Casablanca" },
    },
    required: ["name", "email", "topic", "start"],
    additionalProperties: false,
  },
};

const BookingInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  topic: z.string().trim().min(3).max(1000),
  start: z.string().datetime({ offset: true }),
  visitor_timezone: z.string().trim().max(60).optional(),
});

const gmt = (d: Date) => `${d.toISOString().slice(0, 16).replace("T", " ")} GMT`;

/** Runs the tool. Returns the text for the tool_result block; `isError` makes Claude explain and ask again. */
export async function bookAppointment(input: unknown, ctx: { locale: string; ipHash: string }): Promise<{ content: string; isError: boolean }> {
  const parsed = BookingInput.safeParse(input);
  // Eager input streaming means the API no longer validates tool input: treat any mismatch as invalid.
  if (!parsed.success) return { content: JSON.stringify({ error: "invalid_input", issues: parsed.error.issues.map((i) => i.path.join(".")) }), isError: true };
  const data = parsed.data;

  const start = new Date(data.start);
  const slot = checkSlot(start);
  if (!slot.ok) {
    const hint = {
      past: "The slot must be at least 2 hours from now.",
      too_far: "Pick a slot within the next 60 days.",
      unavailable: "James is unavailable every Friday 18:00 GMT to Saturday 18:00 GMT. Suggest another time.",
    }[slot.reason];
    return { content: JSON.stringify({ error: `slot_${slot.reason}`, hint }), isError: true };
  }

  const rl = await rateLimit(`book:${ctx.ipHash}`, 3, 60 * 60_000);
  if (!rl.ok) return { content: JSON.stringify({ error: "too_many_requests", hint: "Ask the visitor to use the contact form instead." }), isError: true };

  const when = gmt(start);
  let stored = false;
  const db = getDb();
  if (db) {
    try {
      await db.lead.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          company: data.company ?? null,
          title: `Rendez-vous ${when}`,
          message: data.topic,
          source: "CHAT",
          locale: ctx.locale,
          status: "NEW",
          notes: `Rendez-vous demandé via le chatbot : ${when} (${MEETING_MINUTES} min)${data.visitor_timezone ? ` · fuseau du visiteur : ${data.visitor_timezone}` : ""}. À confirmer avec le client.`,
        },
      });
      stored = true;
    } catch (error) {
      console.error("[booking] db error:", (error as Error).message);
    }
  }

  const mailed = await notifyOwner({
    subject: `[Portfolio] Rendez-vous demandé : ${data.name} · ${when}`,
    replyTo: data.email,
    html: renderEmail("Nouvelle demande de rendez-vous (chatbot)", [
      ["Créneau", `${when} · ${MEETING_MINUTES} min`],
      ["Fuseau du visiteur", data.visitor_timezone],
      ["Nom", data.name],
      ["Email", data.email],
      ["Téléphone", data.phone],
      ["Entreprise", data.company],
      ["Sujet", data.topic],
      ["Langue", ctx.locale],
    ]),
  });

  if (!stored && !mailed) return { content: JSON.stringify({ error: "booking_unavailable", hint: "Ask the visitor to use the contact form instead." }), isError: true };
  return { content: JSON.stringify({ ok: true, start_gmt: when, minutes: MEETING_MINUTES, next_step: "James will contact the visitor by email to confirm." }), isError: false };
}
