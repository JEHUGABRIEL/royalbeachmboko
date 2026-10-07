import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { latestNotifications, markRead, unreadCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401, headers: noStore });
  const [unread, items] = await Promise.all([unreadCount(me.id), latestNotifications(me.id)]);
  return NextResponse.json({ unread, items }, { headers: noStore });
}

/** Marque une notification (ou toutes) comme lue. Refuse les appels venant d'un autre site. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  }
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = Number.isInteger(body?.id) ? (body.id as number) : undefined;
  if (!body?.all && !id) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  await markRead(me.id, body?.all ? undefined : id);
  return NextResponse.json({ unread: await unreadCount(me.id) }, { headers: noStore });
}
