import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Enregistre une image envoyée depuis le back-office et renvoie son URL publique. */
export async function saveImage(file: File, folder: string): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error("Format accepté : JPEG, PNG ou WebP.");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (4 Mo maximum).");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Stockage des images non configuré (BLOB_READ_WRITE_TOKEN manquant).");
  }
  // En local sans Vercel Blob : écrit dans public/uploads (servi par `next dev`).
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Supprime une image uploadée (les photos d'origine dans /images ne sont jamais supprimées). */
export async function deleteImage(src: string) {
  try {
    if (src.includes(".blob.vercel-storage.com/")) await del(src);
    else if (src.startsWith("/uploads/")) await unlink(path.join(process.cwd(), "public", src));
  } catch (err) {
    console.warn("[storage] suppression impossible", src, err);
  }
}
