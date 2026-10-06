import { NextResponse } from "next/server";

// Reçoit les messages du formulaire de contact. À relier à un service e-mail.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const contact = typeof body?.contact === "string" ? body.contact.trim() : "";

  if (!name || !message || !contact) {
    return NextResponse.json({ error: "Merci de remplir tous les champs." }, { status: 422 });
  }
  console.info("[contact]", { name, contact, subject: body?.subject, message });
  return NextResponse.json({ message: `Merci ${name}, votre message a bien été reçu. Nous vous répondons rapidement.` });
}
