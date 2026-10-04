"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pricingSchema } from "@/lib/budget";
import { requireDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { parseFields, slugify, type FieldErrors } from "./form-data";
import { requireAdmin } from "./guard";
import { getResource, settingsFields } from "./resources";

export type FormState = { ok?: boolean; error?: string; errors?: FieldErrors; message?: string };

/** Minimal delegate surface shared by all CRUD models. */
type Delegate = {
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
};

function delegate(model: string): Delegate {
  const db = requireDb() as unknown as Record<string, Delegate>;
  return db[model]!;
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

function isUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002";
}

export async function saveResource(key: string, id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return { error: "Ressource inconnue" };

  const { data, errors } = await parseFields(resource.fields, fd, key);
  if (resource.slugFrom && "slug" in data) {
    const source = String(data[resource.slugFrom] ?? "");
    data.slug = slugify(String(data.slug || source));
    if (!data.slug) errors.slug = "Slug requis";
  }
  if (key === "testimonials" && typeof data.rating === "number" && (data.rating < 1 || data.rating > 5)) {
    errors.rating = "La note doit être entre 1 et 5";
  }
  if (Object.keys(errors).length) return { errors, error: "Corrigez les champs en erreur." };

  try {
    if (id) await delegate(resource.model).update({ where: { id }, data });
    else await delegate(resource.model).create({ data });
  } catch (error) {
    if (isUniqueError(error)) return { error: "Une entrée avec ce slug/clé existe déjà.", errors: { slug: "Déjà utilisé", key: "Déjà utilisée" } };
    console.error("[admin] save failed:", error);
    return { error: "Enregistrement impossible." };
  }
  revalidateSite();
  redirect(`/admin/${key}?saved=1`);
}

export async function deleteResource(key: string, id: string): Promise<void> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return;
  await delegate(resource.model).delete({ where: { id } });
  revalidateSite();
  revalidatePath(`/admin/${key}`);
}

export async function toggleResource(key: string, id: string, field: string): Promise<void> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource?.toggles?.includes(field)) return;
  const row = await delegate(resource.model).findUnique({ where: { id } });
  if (!row) return;
  await delegate(resource.model).update({ where: { id }, data: { [field]: !row[field] } });
  revalidateSite();
  revalidatePath(`/admin/${key}`);
}

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors } = await parseFields(settingsFields, fd, "settings");
  if (Object.keys(errors).length) return { errors, error: "Corrigez les champs en erreur." };
  await requireDb().siteSettings.update({ where: { id: "main" }, data: data as Prisma.SiteSettingsUpdateInput });
  revalidateSite();
  return { ok: true, message: "Paramètres enregistrés — le site est à jour." };
}

export async function savePricing(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("pricing") ?? ""));
  } catch {
    return { error: "JSON invalide" };
  }
  const parsed = pricingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ") };
  }
  await requireDb().siteSettings.update({ where: { id: "main" }, data: { pricing: parsed.data } });
  revalidateSite();
  return { ok: true, message: "Tarifs enregistrés." };
}

// ─── Leads (client projects & budgets) ───────────────────────────────────────

const leadStatus = z.enum(["NEW", "DISCUSSION", "QUOTE_SENT", "IN_PROGRESS", "DELIVERED", "LOST"]);
const optInt = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Math.round(Number(v.replace(/\s/g, "").replace(",", ".")))))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Montant invalide");
const optDate = z
  .string()
  .trim()
  .transform((v) => (v ? new Date(v) : null))
  .refine((v) => v === null || !Number.isNaN(v.getTime()), "Date invalide");

const leadUpdateSchema = z.object({
  name: z.string().trim().min(1, "Requis").max(120),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().max(40).transform((v) => v || null),
  company: z.string().trim().max(120).transform((v) => v || null),
  title: z.string().trim().max(200).transform((v) => v || null),
  status: leadStatus,
  estimateMin: optInt,
  estimateMax: optInt,
  budgetValidated: optInt,
  amountPaid: optInt.transform((v) => v ?? 0),
  notes: z.string().trim().max(10000).transform((v) => v || null),
  startDate: optDate,
  dueDate: optDate,
});

export async function saveLead(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = leadUpdateSchema.safeParse(Object.fromEntries(["name", "email", "phone", "company", "title", "status", "estimateMin", "estimateMax", "budgetValidated", "amountPaid", "notes", "startDate", "dueDate"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return { errors, error: "Corrigez les champs en erreur." };
  }
  const db = requireDb();
  if (id) await db.lead.update({ where: { id }, data: parsed.data });
  else {
    const created = await db.lead.create({ data: { ...parsed.data, source: "MANUAL" } });
    redirect(`/admin/leads/${created.id}?saved=1`);
  }
  revalidatePath("/admin/leads");
  return { ok: true, message: "Projet enregistré." };
}

export async function deleteLead(id: string): Promise<void> {
  await requireAdmin();
  await requireDb().lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

// ─── Contact messages & conversations ───────────────────────────────────────

export async function toggleMessageHandled(id: string): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  const msg = await db.contactMessage.findUnique({ where: { id } });
  if (!msg) return;
  await db.contactMessage.update({ where: { id }, data: { handled: !msg.handled } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAdmin();
  await requireDb().contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export async function messageToLead(id: string): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  const msg = await db.contactMessage.findUnique({ where: { id } });
  if (!msg) return;
  const lead = await db.lead.create({
    data: {
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      title: msg.subject,
      message: msg.message,
      notes: msg.budget ? `Budget indiqué : ${msg.budget}` : null,
      source: "CONTACT",
      locale: msg.locale,
    },
  });
  await db.contactMessage.update({ where: { id }, data: { handled: true } });
  redirect(`/admin/leads/${lead.id}`);
}

export async function deleteConversation(id: string): Promise<void> {
  await requireAdmin();
  await requireDb().chatConversation.delete({ where: { id } });
  revalidatePath("/admin/conversations");
  redirect("/admin/conversations");
}
