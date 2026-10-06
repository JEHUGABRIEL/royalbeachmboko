import "server-only";
import { and, asc, eq, gte } from "drizzle-orm";
import { cache } from "react";
import type { EventItem, MenuCategory, Photo } from "./data";
import { db, schema } from "./db";
import type { SiteSettings } from "./db/schema";

export const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Bangui" });

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "site"));
  if (!row) throw new Error("Paramètres du site absents : lancez npm run db:migrate.");
  return row.value;
});

export const getMenu = cache(async (): Promise<MenuCategory[]> => {
  const [cats, items] = await Promise.all([
    db.select().from(schema.menuCategories).orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id)),
    db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.available, true))
      .orderBy(asc(schema.menuItems.position), asc(schema.menuItems.id)),
  ]);
  return cats
    .map((c) => ({
      id: c.slug,
      label: c.label,
      items: items
        .filter((i) => i.categoryId === c.id)
        .map(({ name, description, price, oldPrice, tags }) => ({ name, description, price, oldPrice, tags })),
    }))
    .filter((c) => c.items.length > 0);
});

export const getPhotos = cache(async (): Promise<Photo[]> =>
  db
    .select({ src: schema.photos.src, alt: schema.photos.alt, category: schema.photos.category })
    .from(schema.photos)
    .orderBy(asc(schema.photos.position), asc(schema.photos.id)),
);

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export const toEventItem = (e: typeof schema.events.$inferSelect): EventItem => {
  const [, m, d] = e.date.split("-").map(Number);
  return {
    slug: e.slug,
    title: e.title,
    day: String(d),
    month: MONTHS[m - 1],
    time: e.time,
    place: e.place,
    description: e.description,
    image: e.image,
  };
};

export const getUpcomingEvents = cache(async (): Promise<EventItem[]> => {
  const rows = await db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.published, true), gte(schema.events.date, todayISO())))
    .orderBy(asc(schema.events.date));
  return rows.map(toEventItem);
});
