"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { fail, str } from "@/lib/admin";
import { createSession, destroySession, hashPassword, hashToken, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { clearLimit, clientIp, hitLimit, tooMany } from "@/lib/rate-limit";
import { passwordProblem } from "@/lib/validation";

// Hash factice : la vérification prend le même temps que l'e-mail existe ou non.
const DUMMY_HASH = "$2b$12$c9ACpLUViLzoa04dOJOQp.wTtdkCspYPltlISQ9T/ZRHXmxKpJf5q";

export async function login(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password", 200);
  // 5 essais par compte et 20 par adresse IP, sur 15 minutes.
  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    hitLimit(`login:ip:${ip}`, 20, 15 * 60),
    hitLimit(`login:email:${email}`, 5, 15 * 60),
  ]);
  if (byIp.limited || byEmail.limited) {
    fail("/admin/login", tooMany(Math.max(byIp.limited ? byIp.retryMinutes : 0, byEmail.limited ? byEmail.retryMinutes : 0)));
  }
  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) fail("/admin/login", "E-mail ou mot de passe incorrect.");
  await clearLimit(`login:email:${email}`);
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
  const { limited, retryMinutes } = await hitLimit(`invitation:${await clientIp()}`, 10, 15 * 60);
  if (limited) fail(back, tooMany(retryMinutes));
  const name = str(fd, "name", 100);
  const password = str(fd, "password", 200);
  if (name.length < 2) fail(back, "Merci d'indiquer votre nom.");
  if (password !== str(fd, "confirm", 200)) fail(back, "Les deux mots de passe ne correspondent pas.");

  const passwordHash = await hashPassword(password);
  type Outcome = { ok: true; id: number } | { ok: false; error: string };
  const result = await db.transaction(async (tx): Promise<Outcome> => {
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
    const invalid = { ok: false, error: "Cette invitation n'est plus valide." } as const;
    if (!inv) return invalid;
    const weak = passwordProblem(password, { email: inv.email, name });
    if (weak) return { ok: false, error: weak };
    const [existing] = await tx.select().from(schema.admins).where(eq(schema.admins.email, inv.email)).limit(1);
    if (existing) return invalid;
    const [admin] = await tx
      .insert(schema.admins)
      .values({ email: inv.email, name, passwordHash })
      .returning({ id: schema.admins.id });
    await tx.update(schema.invitations).set({ acceptedAt: new Date() }).where(eq(schema.invitations.id, inv.id));
    return { ok: true, id: admin.id };
  });
  if (!result.ok) fail(back, result.error);
  await createSession(result.id);
  redirect("/admin?ok=" + encodeURIComponent(`Bienvenue ${name} !`));
}
