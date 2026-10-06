import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const ROOT_FOLDER = "royalbeach";

function cloudinary() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return cloud && key && secret ? { cloud, key, secret } : null;
}

/** Signature des requêtes Cloudinary : SHA-1 des paramètres triés suivis du secret. */
function sign(params: Record<string, string>, secret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
}

/** Enregistre une image envoyée depuis le back-office et renvoie son URL publique. */
export async function saveImage(file: File, folder: string): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error("Format accepté : JPEG, PNG ou WebP.");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (4 Mo maximum).");

  const cfg = cloudinary();
  if (cfg) {
    const params = { folder: `${ROOT_FOLDER}/${folder}`, timestamp: String(Math.floor(Date.now() / 1000)) };
    const body = new FormData();
    body.set("file", file);
    body.set("api_key", cfg.key);
    body.set("signature", sign(params, cfg.secret));
    for (const [k, v] of Object.entries(params)) body.set(k, v);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/image/upload`, { method: "POST", body });
    const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
    if (!res.ok || !json.secure_url) {
      console.error("[storage] échec Cloudinary", json.error?.message);
      throw new Error("L'envoi de l'image a échoué. Réessayez.");
    }
    return json.secure_url;
  }

  if (process.env.VERCEL) {
    throw new Error("Stockage des images non configuré (variables CLOUDINARY_* manquantes).");
  }
  // En local sans Cloudinary : écrit dans public/uploads (servi par `next dev`).
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Identifiant Cloudinary d'une URL de type …/image/upload/v123/royalbeach/galerie/abc.jpg */
export function cloudinaryPublicId(url: string) {
  const m = url.match(/\/image\/upload\/(?:[^/]+\/)*?v\d+\/(.+)\.\w+$/);
  return m?.[1] ?? null;
}

/** Supprime une image uploadée (les photos d'origine dans /images ne sont jamais supprimées). */
export async function deleteImage(src: string) {
  try {
    const cfg = cloudinary();
    const publicId = src.includes("res.cloudinary.com/") ? cloudinaryPublicId(src) : null;
    if (cfg && publicId?.startsWith(`${ROOT_FOLDER}/`)) {
      const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
      const body = new FormData();
      for (const [k, v] of Object.entries(params)) body.set(k, v);
      body.set("api_key", cfg.key);
      body.set("signature", sign(params, cfg.secret));
      await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/image/destroy`, { method: "POST", body });
    } else if (src.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", src));
    }
  } catch (err) {
    console.warn("[storage] suppression impossible", src, err);
  }
}
