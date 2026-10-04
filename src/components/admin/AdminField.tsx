"use client";

import Image from "next/image";
import type { Field } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";

function toDateInput(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function AdminField({ field, value, error }: { field: Field; value: unknown; error?: string }) {
  const id = `f-${field.name}`;
  const wide = field.wide || field.type === "textarea" || field.type === "images" || field.type === "multiselect";
  const common = { id, name: field.name, "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-err` : undefined };

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = <textarea {...common} rows={field.rows ?? 4} className="input resize-y" defaultValue={(value as string) ?? ""} required={field.required} />;
      break;
    case "number":
      control = <input {...common} type="number" step={field.step ?? "1"} className="input" defaultValue={value === null || value === undefined ? "" : String(value)} required={field.required} />;
      break;
    case "boolean":
      control = (
        <label className="flex h-[46px] items-center gap-3">
          <input {...common} type="checkbox" defaultChecked={Boolean(value)} className="size-5 accent-[var(--accent)]" />
          <span className="text-sm text-fg-soft">{field.label}</span>
        </label>
      );
      break;
    case "select":
      control = (
        <select {...common} className="input" defaultValue={(value as string) ?? ""} required={field.required}>
          {!field.required ? <option value="">—</option> : null}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "multiselect": {
      const selected = new Set((value as string[]) ?? []);
      control = (
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
          {field.options?.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-bg-elev px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:text-accent">
              <input type="checkbox" name={field.name} value={o.value} defaultChecked={selected.has(o.value)} className="accent-[var(--accent)]" />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    }
    case "tags":
      control = <input {...common} className="input" defaultValue={((value as string[]) ?? []).join(", ")} />;
      break;
    case "date":
      control = <input {...common} type="date" className="input" defaultValue={toDateInput(value)} required={field.required} />;
      break;
    case "image":
    case "pdf": {
      const url = (value as string) ?? "";
      control = (
        <div className="space-y-2">
          <input type="hidden" name={field.name} value={url} />
          {url ? (
            <div className="flex items-center gap-3">
              {field.type === "image" ? (
                <span className="relative block h-16 w-24 overflow-hidden rounded-lg border border-line bg-bg-elev">
                  <Image src={url} alt="" fill sizes="96px" className="object-cover" unoptimized={url.startsWith("/uploads/")} />
                </span>
              ) : (
                <a href={url} target="_blank" rel="noopener" className="truncate text-sm text-accent underline">
                  {url}
                </a>
              )}
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" name={`${field.name}__remove`} /> Retirer
              </label>
            </div>
          ) : null}
          <input
            id={id}
            type="file"
            name={`${field.name}__file`}
            accept={field.type === "pdf" ? "application/pdf" : "image/png,image/jpeg,image/webp,image/avif,image/gif"}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-fg"
          />
        </div>
      );
      break;
    }
    case "images": {
      const urls = (value as string[]) ?? [];
      control = (
        <div className="space-y-3">
          {urls.length ? (
            <div className="flex flex-wrap gap-2">
              {urls.map((u) => (
                <span key={u} className="relative block h-16 w-24 overflow-hidden rounded-lg border border-line bg-bg-elev">
                  <Image src={u} alt="" fill sizes="96px" className="object-cover" unoptimized={u.startsWith("/uploads/")} />
                </span>
              ))}
            </div>
          ) : null}
          <textarea {...common} rows={Math.max(2, urls.length)} className="input font-mono text-xs" defaultValue={urls.join("\n")} placeholder="Une URL d'image par ligne" />
          <input type="file" multiple name={`${field.name}__files`} accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-fg" />
        </div>
      );
      break;
    }
    default:
      control = (
        <input {...common} type={field.type === "url" ? "url" : field.type === "email" ? "email" : "text"} className="input" defaultValue={(value as string) ?? ""} required={field.required} />
      );
  }

  return (
    <div className={cn(wide && "md:col-span-2")}>
      {field.type !== "boolean" ? (
        <label htmlFor={id} id={`${id}-label`} className="label">
          {field.label}
          {field.required ? <span className="text-accent"> *</span> : null}
        </label>
      ) : (
        <span className="label">&nbsp;</span>
      )}
      {control}
      {field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
