import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";
import { clientIp, hitLimit, tooMany } from "@/lib/rate-limit";
import { firstError, reservationSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const { limited, retryMinutes } = await hitLimit(`reservation:${await clientIp()}`, 5, 10 * 60);
  if (limited) return NextResponse.json({ error: tooMany(retryMinutes) }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const parsed = reservationSchema(todayISO()).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 422 });
  const r = parsed.data;

  await db.insert(schema.reservations).values({
    name: r.name,
    phone: r.phone,
    email: r.email || null,
    date: r.date,
    time: r.time,
    guests: r.guests,
    area: r.area,
    occasion: r.occasion || null,
    notes: r.notes || null,
  });
  revalidatePath("/admin", "layout");
  await logActivity({
    actorName: r.name,
    action: "reservation.nouvelle",
    category: "reservation",
    summary: `Nouvelle réservation : ${r.name}, ${r.guests} pers. le ${r.date.split("-").reverse().join("/")} à ${r.time}`,
    link: "/admin/reservations?statut=en_attente",
  });

  const when = new Date(`${r.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return NextResponse.json({
    message: `Merci ${r.name} ! Votre demande pour ${r.guests} personne(s) le ${when} à ${r.time} est bien reçue. Nous vous rappelons pour confirmer.`,
  });
}
