"use server";

import { and, eq } from "drizzle-orm";
import { done, fail, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { hitLimit, tooMany } from "@/lib/rate-limit";
import { deleteImage, saveImage } from "@/lib/storage";

const BACK = "/admin/compte";

export async function updateProfile(fd: FormData) {
  const me = await requireAdmin();
  const name = str(fd, "name", 100);
  if (name.length < 2) fail(BACK, "Nom trop court.");
  await db.update(schema.admins).set({ name }).where(eq(schema.admins.id, me.id));
  if (name !== me.name) {
    await logActivity({ actor: { ...me, name }, action: "compte.nom", category: "admin", summary: `a changé son nom (anciennement ${me.name})`, link: "/admin/admins" });
  }
  done(BACK, "Profil mis à jour.");
}

export async function updateAvatar(fd: FormData) {
  const me = await requireAdmin();
  const file = fd.get("avatar");
  if (!(file instanceof File) || file.size === 0) fail(BACK, "Choisissez une photo.");
  let url: string;
  try {
    url = await saveImage(file, "avatars");
  } catch (err) {
    fail(BACK, (err as Error).message);
  }
  await db.update(schema.admins).set({ avatar: url }).where(eq(schema.admins.id, me.id));
  if (me.avatar) await deleteImage(me.avatar);
  await logActivity({ actor: me, action: "compte.photo", category: "admin", summary: "a changé sa photo de profil", link: "/admin/admins" });
  done(BACK, "Photo de profil mise à jour.");
}

export async function removeAvatar() {
  const me = await requireAdmin();
  if (!me.avatar) fail(BACK, "Aucune photo à supprimer.");
  await db.update(schema.admins).set({ avatar: null }).where(eq(schema.admins.id, me.id));
  await deleteImage(me.avatar);
  await logActivity({ actor: me, action: "compte.photo.suppression", category: "admin", summary: "a supprimé sa photo de profil", link: "/admin/admins" });
  done(BACK, "Photo de profil supprimée.");
}

/** Demande de changement de mot de passe : validée par un autre administrateur, puis lien par e-mail. */
export async function requestPasswordChange() {
  const me = await requireAdmin();
  const { limited, retryMinutes } = await hitLimit(`reset-request:${me.id}`, 3, 60 * 60);
  if (limited) fail(BACK, tooMany(retryMinutes));
  const [pending] = await db
    .select({ id: schema.passwordResets.id })
    .from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.adminId, me.id), eq(schema.passwordResets.status, "en_attente")));
  if (pending) fail(BACK, "Une demande est déjà en attente de validation.");
  await db.insert(schema.passwordResets).values({ adminId: me.id, origin: "compte" });
  await logActivity({
    actor: me,
    action: "securite.reinitialisation.demande",
    category: "securite",
    summary: "a demandé à changer son mot de passe (depuis Mon compte)",
    link: "/admin/admins#reinitialisations",
  });
  done(BACK, "Demande envoyée. Un autre administrateur doit la valider ; vous recevrez ensuite un e-mail.");
}

export async function cancelPasswordRequest() {
  const me = await requireAdmin();
  await db
    .delete(schema.passwordResets)
    .where(and(eq(schema.passwordResets.adminId, me.id), eq(schema.passwordResets.status, "en_attente")));
  await logActivity({ actor: me, action: "securite.reinitialisation.annulation", category: "securite", summary: "a annulé sa demande de changement de mot de passe" });
  done(BACK, "Demande annulée.");
}
