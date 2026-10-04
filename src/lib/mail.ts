import "server-only";
import { Resend } from "resend";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render a simple key/value table email. */
export function renderEmail(title: string, rows: [string, string | undefined | null][]): string {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#666;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#111"><h2 style="font-size:18px">${escapeHtml(title)}</h2><table style="border-collapse:collapse">${body}</table></div>`;
}

/**
 * Sends a notification email to the site owner via Resend.
 * Returns false (without throwing) when Resend is not configured or fails.
 */
export async function notifyOwner(opts: { subject: string; html: string; replyTo?: string; to?: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = opts.to ?? process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.warn("[mail] RESEND_API_KEY or CONTACT_TO_EMAIL missing — email not sent");
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio James Kamz <onboarding@resend.dev>",
      to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error("[mail] send failed:", (error as Error).message);
    return false;
  }
}
