"use server";

import { eq } from "drizzle-orm";
import { done, fail, int, str } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { reservationStatuses, type ReservationStatus } from "@/lib/db/schema";

const backTo = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith("/admin/reservations") ? b : "/admin/reservations";
};

export async function setReservationStatus(fd: FormData) {
  await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  const status = str(fd, "status") as ReservationStatus;
  if (!id || !reservationStatuses.includes(status)) fail(back, "Requête invalide.");
  await db.update(schema.reservations).set({ status }).where(eq(schema.reservations.id, id));
  done(back, status === "confirmee" ? "Réservation confirmée." : status === "annulee" ? "Réservation annulée." : "Réservation remise en attente.");
}

export async function saveReservationNote(fd: FormData) {
  await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  if (!id) fail(back, "Requête invalide.");
  await db
    .update(schema.reservations)
    .set({ adminNote: str(fd, "adminNote", 2000) || null })
    .where(eq(schema.reservations.id, id));
  done(back, "Note enregistrée.");
}

export async function deleteReservation(fd: FormData) {
  await requireAdmin();
  const back = backTo(fd);
  const id = int(fd, "id");
  if (!id) fail(back, "Requête invalide.");
  await db.delete(schema.reservations).where(eq(schema.reservations.id, id));
  done(back, "Réservation supprimée.");
}
