"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { fail, str } from "@/lib/admin";
import { createSession, destroySession, hashPassword, hashToken, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";

// Hash factice : la vérification prend le même temps que l'e-mail existe ou non.
const DUMMY_HASH = "$2b$12$c9ACpLUViLzoa04dOJOQp.wTtdkCspYPltlISQ9T/ZRHXmxKpJf5q";

export async function login(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password", 200);
  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) fail("/admin/login", "E-mail ou mot de passe incorrect.");
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function acceptInvitation(fd: FormData) {
  const token = str(fd, "token", 200);
  const back = `/invitation/${token}`;
  const name = str(fd, "name", 100);
  const password = str(fd, "password", 200);
  if (name.length < 2) fail(back, "Merci d'indiquer votre nom.");
  if (password.length < 8) fail(back, "Le mot de passe doit contenir au moins 8 caractères.");
  if (password !== str(fd, "confirm", 200)) fail(back, "Les deux mots de passe ne correspondent pas.");

  const passwordHash = await hashPassword(password);
  const adminId = await db.transaction(async (tx) => {
    const [inv] = await tx
      .select()
      .from(schema.invitations)
      .where(
        and(
          eq(schema.invitations.tokenHash, hashToken(token)),
          isNull(schema.invitations.acceptedAt),
          gt(schema.invitations.expiresAt, new Date()),
        ),
      )
      .for("update")
      .limit(1);
    if (!inv) return null;
    const [existing] = await tx.select().from(schema.admins).where(eq(schema.admins.email, inv.email)).limit(1);
    if (existing) return null;
    const [admin] = await tx
      .insert(schema.admins)
      .values({ email: inv.email, name, passwordHash })
      .returning({ id: schema.admins.id });
    await tx.update(schema.invitations).set({ acceptedAt: new Date() }).where(eq(schema.invitations.id, inv.id));
    return admin.id;
  });
  if (!adminId) fail(back, "Cette invitation n'est plus valide.");
  await createSession(adminId);
  redirect("/admin?ok=" + encodeURIComponent(`Bienvenue ${name} !`));
}
