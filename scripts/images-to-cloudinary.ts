// Transfère vers Cloudinary les images de la galerie et des événements encore
// servies depuis /images (contenu initial), puis met à jour la base.
// Relançable sans risque : une image déjà envoyée est réutilisée.
// Usage : npx tsx --env-file=.env.local scripts/images-to-cloudinary.ts
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
const key = process.env.CLOUDINARY_API_KEY!;
const secret = process.env.CLOUDINARY_API_SECRET!;
const uploaded = new Map<string, string>();

async function upload(localSrc: string): Promise<string> {
  const cached = uploaded.get(localSrc);
  if (cached) return cached;
  const name = path.basename(localSrc, path.extname(localSrc));
  const params: Record<string, string> = {
    overwrite: "false",
    public_id: `royalbeach/site/${name}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const payload = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const body = new FormData();
  const bytes = await readFile(path.join(process.cwd(), "public", localSrc));
  body.set("file", new Blob([bytes], { type: "image/jpeg" }), path.basename(localSrc));
  for (const [k, v] of Object.entries(params)) body.set(k, v);
  body.set("api_key", key);
  body.set("signature", createHash("sha1").update(payload + secret).digest("hex"));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
  const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
  if (!json.secure_url) throw new Error(`${localSrc} : ${json.error?.message ?? res.status}`);
  uploaded.set(localSrc, json.secure_url);
  return json.secure_url;
}

async function main() {
  if (!cloud || !key || !secret) throw new Error("Variables CLOUDINARY_* manquantes.");
  const pg = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, { max: 1 });
  try {
    const photos = await pg<{ id: number; src: string }[]>`select id, src from photos where src like '/images/%'`;
    for (const p of photos) {
      const url = await upload(p.src);
      await pg`update photos set src = ${url} where id = ${p.id}`;
    }
    const events = await pg<{ id: number; image: string }[]>`select id, image from events where image like '/images/%'`;
    for (const e of events) {
      const url = await upload(e.image);
      await pg`update events set image = ${url} where id = ${e.id}`;
    }
    console.log(`Photos mises à jour : ${photos.length} · événements : ${events.length} · fichiers envoyés : ${uploaded.size}`);
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
