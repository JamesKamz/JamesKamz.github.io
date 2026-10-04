import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const PDF_TYPES: Record<string, string> = { "application/pdf": "pdf" };

export class UploadError extends Error {}

/**
 * Stores an uploaded file and returns its public URL.
 * Production: Vercel Blob (BLOB_READ_WRITE_TOKEN). Development: /public/uploads.
 */
export async function saveUpload(file: File, opts: { kind: "image" | "pdf"; folder: string }): Promise<string> {
  const types = opts.kind === "image" ? IMAGE_TYPES : PDF_TYPES;
  const ext = types[file.type];
  if (!ext) throw new UploadError(`Type de fichier non autorisé (${file.type || "inconnu"})`);
  const max = 4 * 1024 * 1024;
  if (file.size > max) throw new UploadError("Fichier trop volumineux (4 Mo max)");

  const safeFolder = opts.folder.replace(/[^a-z0-9-]/gi, "");
  const name = `${safeFolder}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new UploadError("BLOB_READ_WRITE_TOKEN manquant : configurez Vercel Blob pour les uploads");

  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
