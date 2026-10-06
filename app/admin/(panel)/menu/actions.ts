"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { done, fail, int, slugify, str } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";

const BACK = "/admin/menu";

const backTo = (fd: FormData) => {
  const b = str(fd, "back");
  return b.startsWith("/admin/menu") ? b : BACK;
};

function readItem(fd: FormData, back: string) {
  const name = str(fd, "name", 120);
  const price = int(fd, "price");
  const oldPrice = int(fd, "oldPrice");
  const categoryId = int(fd, "categoryId");
  if (!name) fail(back, "Le nom du plat est obligatoire.");
  if (price === null || Number.isNaN(price)) fail(back, "Prix invalide (nombre entier en FCFA).");
  if (Number.isNaN(oldPrice)) fail(back, "Ancien prix invalide.");
  if (!categoryId) fail(back, "Catégorie invalide.");
  return {
    name,
    categoryId,
    price,
    oldPrice: oldPrice && oldPrice > price ? oldPrice : null,
    description: str(fd, "description", 300),
    tags: str(fd, "tags", 200)
      .split(/[,/]/)
      .map((t) => t.trim())
      .filter(Boolean),
    available: fd.get("available") === "on",
  };
}

export async function createItem(fd: FormData) {
  await requireAdmin();
  const item = readItem(fd, backTo(fd));
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${schema.menuItems.position}), -1)` })
    .from(schema.menuItems)
    .where(eq(schema.menuItems.categoryId, item.categoryId));
  await db.insert(schema.menuItems).values({ ...item, position: Number(max) + 1 });
  done(backTo(fd), `« ${item.name} » ajouté à la carte.`);
}

export async function updateItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(backTo(fd), "Requête invalide.");
  const item = readItem(fd, backTo(fd));
  await db.update(schema.menuItems).set(item).where(eq(schema.menuItems.id, id));
  done(backTo(fd), `« ${item.name} » mis à jour.`);
}

export async function toggleItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(backTo(fd), "Requête invalide.");
  const available = str(fd, "available") === "1";
  await db.update(schema.menuItems).set({ available }).where(eq(schema.menuItems.id, id));
  done(backTo(fd), available ? "Plat de nouveau visible sur le site." : "Plat masqué du site.");
}

export async function deleteItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(backTo(fd), "Requête invalide.");
  await db.delete(schema.menuItems).where(eq(schema.menuItems.id, id));
  done(backTo(fd), "Plat supprimé.");
}

/** Échange la position d'un plat avec son voisin dans la même catégorie. */
export async function moveItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  if (!id) fail(backTo(fd), "Requête invalide.");
  await db.transaction(async (tx) => {
    const [item] = await tx.select().from(schema.menuItems).where(eq(schema.menuItems.id, id));
    if (!item) return;
    const siblings = await tx
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.categoryId, item.categoryId))
      .orderBy(asc(schema.menuItems.position), asc(schema.menuItems.id));
    await reorder(siblings, id, dir, (rowId, position) =>
      tx.update(schema.menuItems).set({ position }).where(eq(schema.menuItems.id, rowId)),
    );
  });
  done(backTo(fd), "Ordre mis à jour.");
}

export async function createCategory(fd: FormData) {
  await requireAdmin();
  const label = str(fd, "label", 60);
  if (!label) fail(BACK, "Nom de catégorie obligatoire.");
  let slug = slugify(label);
  const [exists] = await db.select().from(schema.menuCategories).where(eq(schema.menuCategories.slug, slug));
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${schema.menuCategories.position}), -1)` })
    .from(schema.menuCategories);
  await db.insert(schema.menuCategories).values({ label, slug, position: Number(max) + 1 });
  done(BACK, `Catégorie « ${label} » créée.`);
}

export async function renameCategory(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const label = str(fd, "label", 60);
  if (!id || !label) fail(BACK, "Nom de catégorie obligatoire.");
  await db.update(schema.menuCategories).set({ label }).where(eq(schema.menuCategories.id, id));
  done(BACK, "Catégorie renommée.");
}

export async function moveCategory(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  if (!id) fail(BACK, "Requête invalide.");
  await db.transaction(async (tx) => {
    const cats = await tx
      .select()
      .from(schema.menuCategories)
      .orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id));
    await reorder(cats, id, dir, (rowId, position) =>
      tx.update(schema.menuCategories).set({ position }).where(eq(schema.menuCategories.id, rowId)),
    );
  });
  done(BACK, "Ordre des catégories mis à jour.");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  if (!id) fail(BACK, "Requête invalide.");
  await db.delete(schema.menuCategories).where(and(eq(schema.menuCategories.id, id)));
  done(BACK, "Catégorie et plats associés supprimés.");
}

async function reorder<T extends { id: number }>(
  rows: T[],
  id: number,
  dir: number,
  save: (id: number, position: number) => Promise<unknown>,
) {
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (const [position, row] of rows.entries()) await save(row.id, position);
}
