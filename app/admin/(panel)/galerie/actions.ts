"use server";

import { asc, eq, sql } from "drizzle-orm";
import { done, fail, int, str } from "@/lib/admin";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { photoCategories, type PhotoCategory } from "@/lib/db/schema";
import { deleteImage, saveImage } from "@/lib/storage";

const BACK = "/admin/galerie";

const backTo = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith(BACK) ? b : BACK;
};

const category = (fd: FormData) => {
  const c = str(fd, "category") as PhotoCategory;
  return photoCategories.includes(c) ? c : null;
};

export async function addPhotos(fd: FormData) {
  const me = await requireAdmin();
  const cat = category(fd);
  const alt = str(fd, "alt", 150);
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!cat) fail(BACK, "Catégorie invalide.");
  if (files.length === 0) fail(BACK, "Choisissez au moins une photo.");

  const [{ min }] = await db.select({ min: sql<number>`coalesce(min(${schema.photos.position}), 0)` }).from(schema.photos);
  let position = Number(min) - files.length;
  for (const file of files) {
    let src: string;
    try {
      src = await saveImage(file, "galerie");
    } catch (err) {
      fail(BACK, (err as Error).message);
    }
    // Les nouvelles photos apparaissent en tête de galerie.
    await db.insert(schema.photos).values({ src, alt: alt || "Royal Beach Mbocko", category: cat, position: position++ });
  }
  await logActivity({
    actor: me,
    action: "galerie.ajout",
    category: "galerie",
    summary: `a ajouté ${files.length > 1 ? `${files.length} photos` : "une photo"} (${cat}) à la galerie`,
    link: BACK,
  });
  done(BACK, files.length > 1 ? `${files.length} photos ajoutées.` : "Photo ajoutée.");
}

export async function updatePhoto(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  const cat = category(fd);
  const alt = str(fd, "alt", 150);
  if (!id || !cat || !alt) fail(backTo(fd), "Légende et catégorie obligatoires.");
  await db.update(schema.photos).set({ alt, category: cat }).where(eq(schema.photos.id, id));
  await logActivity({ actor: me, action: "galerie.modification", category: "galerie", summary: `a modifié la photo « ${alt} »`, link: BACK });
  done(backTo(fd), "Photo mise à jour.");
}

export async function movePhoto(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  if (!id) fail(backTo(fd), "Requête invalide.");
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: schema.photos.id }).from(schema.photos).orderBy(asc(schema.photos.position), asc(schema.photos.id));
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (const [position, row] of rows.entries()) {
      await tx.update(schema.photos).set({ position }).where(eq(schema.photos.id, row.id));
    }
  });
  await logActivity({ actor: me, action: "galerie.ordre", category: "galerie", summary: "a réordonné la galerie", link: BACK });
  done(backTo(fd), "Ordre mis à jour.");
}

export async function deletePhoto(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(backTo(fd), "Requête invalide.");
  const [row] = await db.delete(schema.photos).where(eq(schema.photos.id, id)).returning();
  if (row) {
    await deleteImage(row.src);
    await logActivity({ actor: me, action: "galerie.suppression", category: "galerie", summary: `a supprimé la photo « ${row.alt} »`, link: BACK });
  }
  done(backTo(fd), "Photo retirée de la galerie.");
}
