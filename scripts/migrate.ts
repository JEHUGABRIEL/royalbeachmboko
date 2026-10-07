// Applique les migrations puis, si la base est vide, charge le contenu initial.
// Lancé automatiquement avant chaque build (npm run build).
import { existsSync } from "node:fs";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import * as seed from "./seed-data";

async function main() {
  // En local, `npm run build` ne charge pas .env.local : on le lit ici s'il existe.
  if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.warn("[migrate] DATABASE_URL absent — migrations ignorées.");
    return;
  }
  const pg = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(pg, { schema });
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("[migrate] migrations à jour");

    await db.transaction(async (tx) => {
      const [{ n: hasSettings }] = await tx.select({ n: count() }).from(schema.settings);
      if (!hasSettings) {
        await tx.insert(schema.settings).values({ key: "site", value: seed.settings });
        console.log("[seed] paramètres");
      }

      const [{ n: hasMenu }] = await tx.select({ n: count() }).from(schema.menuCategories);
      if (!hasMenu) {
        for (const [ci, cat] of seed.menu.entries()) {
          const [row] = await tx
            .insert(schema.menuCategories)
            .values({ slug: cat.id, label: cat.label, position: ci })
            .returning({ id: schema.menuCategories.id });
          await tx.insert(schema.menuItems).values(
            cat.items.map((it, i) => ({
              categoryId: row.id,
              name: it.name,
              description: it.description,
              price: it.price,
              oldPrice: "oldPrice" in it ? it.oldPrice : null,
              tags: it.tags,
              position: i,
            })),
          );
        }
        console.log("[seed] menu");
      }

      const [{ n: hasPhotos }] = await tx.select({ n: count() }).from(schema.photos);
      if (!hasPhotos) {
        await tx.insert(schema.photos).values(seed.photos.map((p, i) => ({ ...p, position: i })));
        console.log("[seed] galerie");
      }

      const [{ n: hasEvents }] = await tx.select({ n: count() }).from(schema.events);
      if (!hasEvents) {
        await tx.insert(schema.events).values(seed.events);
        console.log("[seed] événements");
      }
    });
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
