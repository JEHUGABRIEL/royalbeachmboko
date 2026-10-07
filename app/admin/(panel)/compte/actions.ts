"use server";

import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { done, fail, str } from "@/lib/admin";
import { hashPassword, hashToken, requireAdmin, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { hitLimit, tooMany } from "@/lib/rate-limit";
import { passwordProblem } from "@/lib/validation";

const BACK = "/admin/compte";

export async function updateProfile(fd: FormData) {
  const me = await requireAdmin();
  const name = str(fd, "name", 100);
  if (name.length < 2) fail(BACK, "Nom trop court.");
  await db.update(schema.admins).set({ name }).where(eq(schema.admins.id, me.id));
  done(BACK, "Profil mis à jour.");
}

export async function changePassword(fd: FormData) {
  const me = await requireAdmin();
  const current = str(fd, "current", 200);
  const next = str(fd, "password", 200);
  const { limited, retryMinutes } = await hitLimit(`password:${me.id}`, 5, 15 * 60);
  if (limited) fail(BACK, tooMany(retryMinutes));
  const weak = passwordProblem(next, { email: me.email, name: me.name });
  if (weak) fail(BACK, weak);
  if (next !== str(fd, "confirm", 200)) fail(BACK, "Les deux mots de passe ne correspondent pas.");
  const [row] = await db.select().from(schema.admins).where(eq(schema.admins.id, me.id));
  if (!row || !(await verifyPassword(current, row.passwordHash))) fail(BACK, "Mot de passe actuel incorrect.");
  await db.update(schema.admins).set({ passwordHash: await hashPassword(next) }).where(eq(schema.admins.id, me.id));
  // Déconnecte les autres appareils.
  const token = (await cookies()).get("rb_session")?.value ?? "";
  await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.adminId, me.id), ne(schema.sessions.id, hashToken(token))));
  done(BACK, "Mot de passe modifié. Vos autres appareils ont été déconnectés.");
}
