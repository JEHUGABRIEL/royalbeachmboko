"use server";

import { eq } from "drizzle-orm";
import { done, fail, int, str } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export async function toggleMessageRead(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail("/admin/messages", "Requête invalide.");
  const read = str(fd, "read") === "1";
  await db.update(schema.messages).set({ read }).where(eq(schema.messages.id, id));
  done("/admin/messages", read ? "Message marqué comme lu." : "Message marqué comme non lu.");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail("/admin/messages", "Requête invalide.");
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
  done("/admin/messages", "Message supprimé.");
}
