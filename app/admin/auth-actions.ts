"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { done, fail, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { createSession, destroySession, getCurrentAdmin, hashPassword, hashToken, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { roleFor } from "@/lib/db/schema";
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
  if (!admin || !ok) {
    await logActivity({
      actorName: admin?.name ?? "Inconnu",
      action: "connexion.echec",
      category: "connexion",
      summary: `Échec de connexion pour ${email.slice(0, 120) || "(e-mail vide)"}`,
      link: "/admin/activite?type=connexion",
    });
    fail("/admin/login", "E-mail ou mot de passe incorrect.");
  }
  await clearLimit(`login:email:${email}`);
  await createSession(admin.id);
  await logActivity({
    actor: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
    action: "connexion.reussie",
    category: "connexion",
    summary: "s'est connecté au back-office",
    link: "/admin/activite?type=connexion",
  });
  redirect("/admin");
}

export async function logout() {
  const me = await getCurrentAdmin();
  if (me) await logActivity({ actor: me, action: "connexion.deconnexion", category: "connexion", summary: "s'est déconnecté" });
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
  type Outcome = { ok: true; id: number; email: string } | { ok: false; error: string };
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
      .values({ email: inv.email, name, passwordHash, role: roleFor(inv.email) })
      .returning({ id: schema.admins.id });
    await tx.update(schema.invitations).set({ acceptedAt: new Date() }).where(eq(schema.invitations.id, inv.id));
    return { ok: true, id: admin.id, email: inv.email };
  });
  if (!result.ok) fail(back, result.error);
  await createSession(result.id);
  await logActivity({
    actor: { id: result.id, name, email: result.email, role: roleFor(result.email), avatar: null },
    action: "admin.arrivee",
    category: "admin",
    summary: "a accepté son invitation et rejoint le back-office",
    link: "/admin/admins",
  });
  redirect("/admin?ok=" + encodeURIComponent(`Bienvenue ${name} !`));
}

// ---------- Mot de passe oublié ----------

const FORGOT = "/admin/mot-de-passe-oublie";
const FORGOT_OK =
  "Si un compte correspond à cette adresse, votre demande a été transmise aux administrateurs. Vous recevrez un e-mail dès qu'elle sera validée.";

/** Crée une demande de réinitialisation, à valider par un autre administrateur. */
export async function requestPasswordReset(fd: FormData) {
  const email = str(fd, "email", 200).toLowerCase();
  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    hitLimit(`forgot:ip:${ip}`, 5, 60 * 60),
    hitLimit(`forgot:email:${email}`, 3, 60 * 60),
  ]);
  if (byIp.limited || byEmail.limited) fail(FORGOT, tooMany(Math.max(byIp.retryMinutes, byEmail.retryMinutes)));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(FORGOT, "Adresse e-mail invalide.");

  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  if (admin) {
    const [pending] = await db
      .select({ id: schema.passwordResets.id })
      .from(schema.passwordResets)
      .where(and(eq(schema.passwordResets.adminId, admin.id), eq(schema.passwordResets.status, "en_attente")));
    if (!pending) {
      await db.insert(schema.passwordResets).values({ adminId: admin.id, origin: "connexion" });
      await logActivity({
        actorName: admin.name,
        action: "securite.reinitialisation.demande",
        category: "securite",
        summary: `${admin.name} a demandé la réinitialisation de son mot de passe (mot de passe oublié)`,
        link: "/admin/admins#reinitialisations",
      });
    }
  }
  // Même réponse que le compte existe ou non : on ne révèle pas les adresses des administrateurs.
  done(FORGOT, FORGOT_OK);
}

/** Le demandeur choisit son nouveau mot de passe via le lien reçu par e-mail. */
export async function completePasswordReset(fd: FormData) {
  const token = str(fd, "token", 200);
  const back = `/reinitialisation/${token}`;
  const { limited, retryMinutes } = await hitLimit(`reset:${await clientIp()}`, 10, 15 * 60);
  if (limited) fail(back, tooMany(retryMinutes));
  const password = str(fd, "password", 200);
  if (password !== str(fd, "confirm", 200)) fail(back, "Les deux mots de passe ne correspondent pas.");

  const [row] = await db
    .select({ reset: schema.passwordResets, admin: schema.admins })
    .from(schema.passwordResets)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.passwordResets.adminId))
    .where(
      and(
        eq(schema.passwordResets.tokenHash, hashToken(token)),
        eq(schema.passwordResets.status, "acceptee"),
        gt(schema.passwordResets.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) fail(back, "Ce lien a expiré ou a déjà été utilisé.");
  const weak = passwordProblem(password, { email: row.admin.email, name: row.admin.name });
  if (weak) fail(back, weak);

  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx.update(schema.admins).set({ passwordHash }).where(eq(schema.admins.id, row.admin.id));
    await tx
      .update(schema.passwordResets)
      .set({ status: "utilisee", tokenHash: null })
      .where(eq(schema.passwordResets.id, row.reset.id));
    // Toutes les sessions ouvertes sont fermées.
    await tx.delete(schema.sessions).where(eq(schema.sessions.adminId, row.admin.id));
  });
  await logActivity({
    actor: { id: row.admin.id, name: row.admin.name, email: row.admin.email, role: row.admin.role, avatar: row.admin.avatar },
    action: "securite.reinitialisation.terminee",
    category: "securite",
    summary: "a défini un nouveau mot de passe après réinitialisation",
    link: "/admin/activite?type=securite",
  });
  redirect("/admin/login?ok=" + encodeURIComponent("Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe."));
}
