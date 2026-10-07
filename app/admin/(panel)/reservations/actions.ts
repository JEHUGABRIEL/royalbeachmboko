"use server";

import { eq } from "drizzle-orm";
import { done, fail, int, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { reservationStatuses, type ReservationStatus } from "@/lib/db/schema";

const backTo = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith("/admin/reservations") ? b : "/admin/reservations";
};

const label = async (id: number) => {
  const [r] = await db
    .select({ name: schema.reservations.name, date: schema.reservations.date, time: schema.reservations.time })
    .from(schema.reservations)
    .where(eq(schema.reservations.id, id));
  return r ? `${r.name} (${r.date.split("-").reverse().join("/")} à ${r.time})` : `n°${id}`;
};

export async function setReservationStatus(fd: FormData) {
  const me = await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  const status = str(fd, "status") as ReservationStatus;
  if (!id || !reservationStatuses.includes(status)) fail(back, "Requête invalide.");
  await db.update(schema.reservations).set({ status }).where(eq(schema.reservations.id, id));
  const verb = status === "confirmee" ? "a confirmé" : status === "annulee" ? "a annulé" : "a remis en attente";
  await logActivity({ actor: me, action: "reservation.statut", category: "reservation", summary: `${verb} la réservation de ${await label(id)}`, link: "/admin/reservations" });
  done(back, status === "confirmee" ? "Réservation confirmée." : status === "annulee" ? "Réservation annulée." : "Réservation remise en attente.");
}

export async function saveReservationNote(fd: FormData) {
  const me = await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  if (!id) fail(back, "Requête invalide.");
  await db
    .update(schema.reservations)
    .set({ adminNote: str(fd, "adminNote", 2000) || null })
    .where(eq(schema.reservations.id, id));
  await logActivity({ actor: me, action: "reservation.note", category: "reservation", summary: `a modifié la note de la réservation de ${await label(id)}`, link: "/admin/reservations" });
  done(back, "Note enregistrée.");
}

export async function deleteReservation(fd: FormData) {
  const me = await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  if (!id) fail(back, "Requête invalide.");
  const what = await label(id);
  await db.delete(schema.reservations).where(eq(schema.reservations.id, id));
  await logActivity({ actor: me, action: "reservation.suppression", category: "reservation", summary: `a supprimé la réservation de ${what}`, link: "/admin/reservations" });
  done(back, "Réservation supprimée.");
}
