import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const field = (k: string, max: number) => (typeof body?.[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const name = field("name", 200);
  const contact = field("contact", 200);
  const message = field("message", 5000);

  if (!name || !message || !contact) {
    return NextResponse.json({ error: "Merci de remplir tous les champs." }, { status: 422 });
  }
  await db.insert(schema.messages).values({ name, contact, message, subject: field("subject", 100) || null });
  revalidatePath("/admin", "layout");
  return NextResponse.json({ message: `Merci ${name}, votre message a bien été reçu. Nous vous répondons rapidement.` });
}
