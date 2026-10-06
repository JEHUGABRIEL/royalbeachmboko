"use server";

import { and, count, eq, isNull } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { LINK_COOKIE, done, fail, int, str } from "@/lib/admin";
import { hashToken, newToken, requireAdmin, type CurrentAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { invitationEmail, sendMail } from "@/lib/mail";

const BACK = "/admin/admins";
const INVITE_DAYS = 7;

async function siteOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Génère un nouveau jeton, l'enregistre et envoie l'e-mail. Si l'envoi échoue, le lien est proposé à copier. */
async function issueInvitation(email: string, inviter: CurrentAdmin, existingId?: number) {
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
  if (!sent) {
    (await cookies()).set(LINK_COOKIE, JSON.stringify({ email, link }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: BACK,
      maxAge: 300,
    });
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
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  await db.delete(schema.invitations).where(and(eq(schema.invitations.id, id), isNull(schema.invitations.acceptedAt)));
  done(BACK, "Invitation annulée.");
}

export async function removeAdmin(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  if (id === me.id) fail(BACK, "Vous ne pouvez pas supprimer votre propre compte.");
  const [{ n }] = await db.select({ n: count() }).from(schema.admins);
  if (n <= 1) fail(BACK, "Il doit rester au moins un administrateur.");
  const [row] = await db.delete(schema.admins).where(eq(schema.admins.id, id)).returning();
  done(BACK, row ? `${row.name} n'a plus accès au back-office.` : "Administrateur introuvable.");
}
