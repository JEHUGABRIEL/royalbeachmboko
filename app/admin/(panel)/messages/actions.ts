"use server";

import { eq } from "drizzle-orm";
import { done, fail, int, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";

const back = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith("/admin/messages") ? b : "/admin/messages";
};

const author = async (id: number) => {
  const [m] = await db.select({ name: schema.messages.name }).from(schema.messages).where(eq(schema.messages.id, id));
  return m?.name ?? `n°${id}`;
};

export async function toggleMessageRead(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail("/admin/messages", "Requête invalide.");
  const read = str(fd, "read") === "1";
  await db.update(schema.messages).set({ read }).where(eq(schema.messages.id, id));
  await logActivity({ actor: me, action: "message.lecture", category: "message", summary: `a marqué le message de ${await author(id)} comme ${read ? "lu" : "non lu"}`, link: "/admin/messages" });
  done(back(fd), read ? "Message marqué comme lu." : "Message marqué comme non lu.");
}

export async function deleteMessage(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail("/admin/messages", "Requête invalide.");
  const who = await author(id);
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
  await logActivity({ actor: me, action: "message.suppression", category: "message", summary: `a supprimé le message de ${who}`, link: "/admin/messages" });
  done(back(fd), "Message supprimé.");
}
