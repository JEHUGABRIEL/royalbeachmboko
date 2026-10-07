import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "./db";
import type { AdminRole } from "./db/schema";

const COOKIE = "rb_session";
const SESSION_DAYS = 30;

export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function createSession(adminId: number) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(schema.sessions).values({ id: hashToken(token), adminId, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  jar.delete(COOKIE);
}

export type CurrentAdmin = { id: number; email: string; name: string; role: AdminRole; avatar: string | null };

export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({
      id: schema.admins.id,
      email: schema.admins.email,
      name: schema.admins.name,
      role: schema.admins.role,
      avatar: schema.admins.avatar,
    })
    .from(schema.sessions)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.sessions.adminId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

/** À appeler en tête de chaque page et action du back-office. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Réservé au superadmin (gestion des comptes administrateurs). */
export async function requireSuperadmin(): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== "superadmin") redirect("/admin?error=" + encodeURIComponent("Action réservée au superadmin."));
  return admin;
}
