import { NextResponse } from "next/server";

// Valide la demande de réservation. Aucun envoi n'est encore branché :
// relier ici un service e-mail / SMS / WhatsApp pour notifier le restaurant.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const name = str("name");
  const phone = str("phone");
  const date = str("date");
  const time = str("time");
  const guests = str("guests");

  if (!name || !phone || !date || !time || !guests) {
    return NextResponse.json({ error: "Merci de renseigner nom, téléphone, date, heure et nombre de personnes." }, { status: 422 });
  }
  if (!/^\+?[\d\s.-]{8,}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 422 });
  }
  const day = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(day.getTime()) || day < today) {
    return NextResponse.json({ error: "Merci de choisir une date à venir." }, { status: 422 });
  }

  console.info("[reservation]", { name, phone, date, time, guests, email: str("email"), area: str("area"), occasion: str("occasion"), notes: str("notes") });

  const when = day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return NextResponse.json({
    message: `Merci ${name} ! Votre demande pour ${guests} personne(s) le ${when} à ${time} est bien reçue. Nous vous rappelons pour confirmer.`,
  });
}
