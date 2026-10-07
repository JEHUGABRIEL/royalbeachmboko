import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { clientIp, hitLimit, tooMany } from "@/lib/rate-limit";
import { contactSchema, firstError } from "@/lib/validation";

export async function POST(req: Request) {
  const { limited, retryMinutes } = await hitLimit(`contact:${await clientIp()}`, 5, 10 * 60);
  if (limited) return NextResponse.json({ error: tooMany(retryMinutes) }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 422 });
  const m = parsed.data;

  await db.insert(schema.messages).values({ name: m.name, contact: m.contact, subject: m.subject, message: m.message });
  revalidatePath("/admin", "layout");
  return NextResponse.json({ message: `Merci ${m.name}, votre message a bien été reçu. Nous vous répondons rapidement.` });
}
