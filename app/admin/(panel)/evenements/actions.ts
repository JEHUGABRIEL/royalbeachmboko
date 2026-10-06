"use server";

import { and, eq, ne } from "drizzle-orm";
import { done, fail, int, slugify, str } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { deleteImage, saveImage } from "@/lib/storage";

const BACK = "/admin/evenements";

const backTo = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith(BACK) ? b : BACK;
};

export async function saveEvent(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const back = backTo(fd);
  const title = str(fd, "title", 120);
  const date = str(fd, "date", 10);
  const time = str(fd, "time", 60);
  const place = str(fd, "place", 120);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !place) {
    fail(back, "Titre, date, horaires et lieu sont obligatoires.");
  }

  const [current] = id ? await db.select().from(schema.events).where(eq(schema.events.id, id)) : [];
  if (id && !current) fail(BACK, "Événement introuvable.");

  const file = fd.get("image");
  let image = current?.image;
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveImage(file, "evenements");
    } catch (err) {
      fail(back, (err as Error).message);
    }
  }
  if (!image) fail(back, "Ajoutez une image pour l'événement.");

  // Slug unique, utilisé dans les liens « Réserver ma place ».
  let slug = slugify(title);
  const [clash] = await db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(id ? and(eq(schema.events.slug, slug), ne(schema.events.id, id)) : eq(schema.events.slug, slug));
  if (clash) slug = `${slug}-${date}`;

  const values = {
    title,
    slug,
    date,
    time,
    place,
    image,
    description: str(fd, "description", 600),
    published: fd.get("published") === "on",
  };
  if (current) {
    await db.update(schema.events).set(values).where(eq(schema.events.id, current.id));
    if (current.image !== image) await deleteImage(current.image);
  } else {
    await db.insert(schema.events).values(values);
  }
  done(back, `Événement « ${title} » enregistré.`);
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(backTo(fd), "Requête invalide.");
  const [row] = await db.delete(schema.events).where(eq(schema.events.id, id)).returning();
  if (row) await deleteImage(row.image);
  done(backTo(fd), "Événement supprimé.");
}
