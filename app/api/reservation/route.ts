import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const str = (k: string, max = 200) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const name = str("name");
  const phone = str("phone", 40);
  const date = str("date", 10);
  const time = str("time", 5);
  const guests = str("guests", 10);

  if (!name || !phone || !date || !time || !guests) {
    return NextResponse.json({ error: "Merci de renseigner nom, téléphone, date, heure et nombre de personnes." }, { status: 422 });
  }
  if (!/^\+?[\d\s.-]{8,}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 422 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO()) {
    return NextResponse.json({ error: "Merci de choisir une date à venir." }, { status: 422 });
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Heure invalide." }, { status: 422 });
  }

  await db.insert(schema.reservations).values({
    name,
    phone,
    date,
    time,
    guests,
    email: str("email") || null,
    area: str("area") || null,
    occasion: str("occasion") || null,
    notes: str("notes", 2000) || null,
  });
  revalidatePath("/admin", "layout");

  const when = new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return NextResponse.json({
    message: `Merci ${name} ! Votre demande pour ${guests} personne(s) le ${when} à ${time} est bien reçue. Nous vous rappelons pour confirmer.`,
  });
}
