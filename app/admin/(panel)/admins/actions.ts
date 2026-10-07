"use server";

import { and, count, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { LINK_COOKIE, done, fail, int, siteOrigin, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { hashToken, newToken, requireAdmin, requireSuperadmin, type CurrentAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { invitationEmail, resetEmail, sendMail } from "@/lib/mail";
import { hitLimit, tooMany } from "@/lib/rate-limit";

const BACK = "/admin/admins";
const INVITE_DAYS = 7;

/** Génère un nouveau jeton, l'enregistre et envoie l'e-mail. Si l'envoi échoue, le lien est proposé à copier. */
/** Mémorise brièvement un lien à transmettre à la main quand l'e-mail n'a pas pu partir. */
async function rememberLink(kind: "invitation" | "reinitialisation", email: string, link: string) {
  (await cookies()).set(LINK_COOKIE, JSON.stringify({ kind, email, link }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: BACK,
    maxAge: 300,
  });
}

async function issueInvitation(email: string, inviter: CurrentAdmin, existingId?: number) {
  // Évite l'envoi massif d'e-mails : 10 invitations par administrateur et par heure.
  const { limited, retryMinutes } = await hitLimit(`invite:${inviter.id}`, 10, 60 * 60);
  if (limited) fail(BACK, tooMany(retryMinutes));
  const token = newToken();
  const values = { tokenHash: hashToken(token), expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000) };
  if (existingId) {
    await db.update(schema.invitations).set(values).where(eq(schema.invitations.id, existingId));
  } else {
    await db.insert(schema.invitations).values({ ...values, email, invitedBy: inviter.id });
  }
  const link = `${await siteOrigin()}/invitation/${token}`;
  const mail = invitationEmail(link, inviter.name);
  const sent = await sendMail(email, mail.subject, mail.html, mail.text);
  await logActivity({
    actor: inviter,
    action: existingId ? "admin.invitation.renvoi" : "admin.invitation",
    category: "admin",
    summary: `a ${existingId ? "renvoyé l'invitation de" : "invité"} ${email}`,
    link: BACK,
  });
  if (!sent) {
    await rememberLink("invitation", email, link);
    done(BACK, `Invitation créée pour ${email}, mais l'e-mail n'a pas pu être envoyé : transmettez-lui le lien ci-dessous.`);
  }
  done(BACK, `Invitation envoyée à ${email}.`);
}

export async function inviteAdmin(fd: FormData) {
  const me = await requireAdmin();
  const email = str(fd, "email", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(BACK, "Adresse e-mail invalide.");
  const [existing] = await db.select().from(schema.admins).where(eq(schema.admins.email, email));
  if (existing) fail(BACK, `${email} est déjà administrateur.`);
  const [pending] = await db
    .select()
    .from(schema.invitations)
    .where(and(eq(schema.invitations.email, email), isNull(schema.invitations.acceptedAt)));
  await issueInvitation(email, me, pending?.id);
}

export async function resendInvitation(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  const [inv] = await db
    .select()
    .from(schema.invitations)
    .where(and(eq(schema.invitations.id, id), isNull(schema.invitations.acceptedAt)));
  if (!inv) fail(BACK, "Invitation introuvable.");
  await issueInvitation(inv.email, me, inv.id);
}

export async function cancelInvitation(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  const [row] = await db
    .delete(schema.invitations)
    .where(and(eq(schema.invitations.id, id), isNull(schema.invitations.acceptedAt)))
    .returning();
  if (row) await logActivity({ actor: me, action: "admin.invitation.annulation", category: "admin", summary: `a annulé l'invitation de ${row.email}`, link: BACK });
  done(BACK, "Invitation annulée.");
}

export async function removeAdmin(fd: FormData) {
  const me = await requireSuperadmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  if (id === me.id) fail(BACK, "Vous ne pouvez pas supprimer votre propre compte.");
  const [{ n }] = await db.select({ n: count() }).from(schema.admins);
  if (n <= 1) fail(BACK, "Il doit rester au moins un administrateur.");
  const [target] = await db.select({ role: schema.admins.role }).from(schema.admins).where(eq(schema.admins.id, id));
  if (target?.role === "superadmin") fail(BACK, "Le compte superadmin ne peut pas être retiré.");
  const [row] = await db.delete(schema.admins).where(eq(schema.admins.id, id)).returning();
  if (row) await logActivity({ actor: me, action: "admin.retrait", category: "admin", summary: `a retiré l'accès de ${row.name} (${row.email})`, link: BACK });
  done(BACK, row ? `${row.name} n'a plus accès au back-office.` : "Administrateur introuvable.");
}

// ---------- Demandes de réinitialisation de mot de passe ----------

const RESET_HOURS = 24;

async function pendingReset(id: number) {
  const [row] = await db
    .select({ reset: schema.passwordResets, admin: { id: schema.admins.id, name: schema.admins.name, email: schema.admins.email } })
    .from(schema.passwordResets)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.passwordResets.adminId))
    .where(and(eq(schema.passwordResets.id, id), eq(schema.passwordResets.status, "en_attente")));
  return row;
}

/** Un autre administrateur (admin ou superadmin) valide la demande : un lien est envoyé au demandeur. */
export async function approveReset(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  const row = id ? await pendingReset(id) : undefined;
  if (!row) fail(BACK, "Demande introuvable ou déjà traitée.");
  if (row.admin.id === me.id) fail(BACK, "Votre propre demande doit être validée par un autre administrateur.");

  const token = newToken();
  await db
    .update(schema.passwordResets)
    .set({
      status: "acceptee",
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_HOURS * 3_600_000),
      decidedBy: me.id,
      decidedAt: new Date(),
    })
    .where(eq(schema.passwordResets.id, row.reset.id));

  const link = `${await siteOrigin()}/reinitialisation/${token}`;
  const mail = resetEmail(link, row.admin.name, me.name);
  const sent = await sendMail(row.admin.email, mail.subject, mail.html, mail.text);
  await logActivity({
    actor: me,
    action: "securite.reinitialisation.acceptee",
    category: "securite",
    summary: `a validé la réinitialisation du mot de passe de ${row.admin.name}`,
    link: BACK,
  });
  if (!sent) {
    await rememberLink("reinitialisation", row.admin.email, link);
    done(BACK, `Demande validée, mais l'e-mail n'a pas pu partir : transmettez le lien ci-dessous à ${row.admin.name}.`);
  }
  done(BACK, `Demande validée : ${row.admin.name} a reçu un e-mail pour choisir un nouveau mot de passe.`);
}

export async function refuseReset(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  const row = id ? await pendingReset(id) : undefined;
  if (!row) fail(BACK, "Demande introuvable ou déjà traitée.");
  if (row.admin.id === me.id) fail(BACK, "Votre propre demande doit être traitée par un autre administrateur.");
  await db
    .update(schema.passwordResets)
    .set({ status: "refusee", decidedBy: me.id, decidedAt: new Date() })
    .where(eq(schema.passwordResets.id, row.reset.id));
  await logActivity({
    actor: me,
    action: "securite.reinitialisation.refusee",
    category: "securite",
    summary: `a refusé la demande de réinitialisation de ${row.admin.name}`,
    link: BACK,
  });
  done(BACK, "Demande refusée.");
}
