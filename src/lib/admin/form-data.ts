import "server-only";
import { z } from "zod";
import { saveUpload, UploadError } from "@/lib/upload";
import type { Field } from "./resources";

export type FieldErrors = Record<string, string>;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const urlSchema = z.string().url();
const emailSchema = z.string().email();
const str = (fd: FormData, name: string) => {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
};

/** Convert a FormData submission into a Prisma-ready object according to field definitions. */
export async function parseFields(
  fields: Field[],
  fd: FormData,
  folder: string,
): Promise<{ data: Record<string, unknown>; errors: FieldErrors }> {
  const data: Record<string, unknown> = {};
  const errors: FieldErrors = {};
  const required = "Champ requis";

  for (const field of fields) {
    const { name, type } = field;
    try {
      switch (type) {
        case "text":
        case "textarea":
        case "url":
        case "email": {
          const value = str(fd, name);
          if (!value) {
            if (field.required) errors[name] = required;
            data[name] = field.nullable ? null : "";
            break;
          }
          if (value.length > 20000) errors[name] = "Texte trop long";
          if (type === "url" && !urlSchema.safeParse(value).success) errors[name] = "URL invalide (https://…)";
          if (type === "email" && !emailSchema.safeParse(value).success) errors[name] = "Email invalide";
          data[name] = value;
          break;
        }
        case "number": {
          const raw = str(fd, name);
          if (!raw) {
            if (field.required) errors[name] = required;
            data[name] = field.nullable ? null : 0;
            break;
          }
          const n = Number(raw.replace(",", "."));
          if (!Number.isFinite(n)) errors[name] = "Nombre invalide";
          data[name] = field.step === "any" ? n : Math.round(n);
          break;
        }
        case "boolean":
          data[name] = fd.get(name) === "on";
          break;
        case "select": {
          const value = str(fd, name);
          const allowed = field.options?.some((o) => o.value === value);
          if (!value || !allowed) {
            if (field.required || value) errors[name] = value ? "Valeur invalide" : required;
            if (!value && !field.required) data[name] = field.options?.[0]?.value;
            break;
          }
          data[name] = value;
          break;
        }
        case "multiselect": {
          const values = fd.getAll(name).map(String).filter((v) => field.options?.some((o) => o.value === v));
          if (field.required && !values.length) errors[name] = "Choisissez au moins une option";
          data[name] = values;
          break;
        }
        case "tags": {
          const values = str(fd, name)
            .split(/[,\n]/)
            .map((v) => v.trim())
            .filter(Boolean);
          if (field.required && !values.length) errors[name] = required;
          data[name] = Array.from(new Set(values));
          break;
        }
        case "date": {
          const raw = str(fd, name);
          if (!raw) {
            if (field.required) errors[name] = required;
            data[name] = null;
            break;
          }
          const d = new Date(raw);
          if (Number.isNaN(d.getTime())) errors[name] = "Date invalide";
          data[name] = d;
          break;
        }
        case "image":
        case "pdf": {
          const file = fd.get(`${name}__file`);
          if (file instanceof File && file.size > 0) {
            data[name] = await saveUpload(file, { kind: type === "pdf" ? "pdf" : "image", folder });
          } else if (fd.get(`${name}__remove`) === "on") {
            data[name] = null;
          } else {
            data[name] = str(fd, name) || null;
          }
          break;
        }
        case "images": {
          const kept = str(fd, name)
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean);
          const uploads: string[] = [];
          for (const file of fd.getAll(`${name}__files`)) {
            if (file instanceof File && file.size > 0) uploads.push(await saveUpload(file, { kind: "image", folder }));
          }
          data[name] = [...kept, ...uploads];
          break;
        }
      }
    } catch (error) {
      errors[name] = error instanceof UploadError ? error.message : "Erreur de traitement";
      if (!(error instanceof UploadError)) console.error(`[admin] field ${name}:`, error);
    }
  }
  return { data, errors };
}
