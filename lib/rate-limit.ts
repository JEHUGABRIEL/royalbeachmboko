import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db, schema } from "./db";

/** Adresse IP du visiteur (Vercel renseigne x-forwarded-for, la première valeur est le client). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}

/**
 * Incrémente le compteur `key` sur une fenêtre de `windowSeconds` et indique si
 * la limite est dépassée. Opération atomique (une seule requête upsert).
 */
export async function hitLimit(key: string, limit: number, windowSeconds: number) {
  const window = sql.raw(`interval '${Math.floor(windowSeconds)} seconds'`);
  const [row] = await db
    .insert(schema.rateLimits)
    .values({ key, count: 1, resetAt: sql`now() + ${window}` })
    .onConflictDoUpdate({
      target: schema.rateLimits.key,
      set: {
        count: sql`case when ${schema.rateLimits.resetAt} < now() then 1 else ${schema.rateLimits.count} + 1 end`,
        resetAt: sql`case when ${schema.rateLimits.resetAt} < now() then now() + ${window} else ${schema.rateLimits.resetAt} end`,
      },
    })
    .returning({ count: schema.rateLimits.count, resetAt: schema.rateLimits.resetAt });

  // Ménage occasionnel des compteurs expirés.
  if (Math.random() < 0.02) {
    await db.delete(schema.rateLimits).where(sql`${schema.rateLimits.resetAt} < now() - interval '1 day'`);
  }

  const limited = row.count > limit;
  const retryMinutes = Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 60_000));
  return { limited, retryMinutes };
}

/** Remet un compteur à zéro (ex. après une connexion réussie). */
export async function clearLimit(key: string) {
  await db.delete(schema.rateLimits).where(sql`${schema.rateLimits.key} = ${key}`);
}

export const tooMany = (minutes: number) =>
  `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
