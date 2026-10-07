import "server-only";
import { ne } from "drizzle-orm";
import type { CurrentAdmin } from "./auth";
import { db, schema } from "./db";
import { clientIp } from "./rate-limit";

export const activityCategories = {
  connexion: "Connexions",
  reservation: "Réservations",
  message: "Messages",
  menu: "Menu",
  evenement: "Événements",
  galerie: "Galerie",
  parametres: "Paramètres",
  admin: "Administrateurs",
  securite: "Sécurité",
} as const;
export type ActivityCategory = keyof typeof activityCategories;

type Entry = {
  /** Administrateur à l'origine de l'action ; absent pour un visiteur du site. */
  actor?: CurrentAdmin | null;
  /** Nom affiché quand il n'y a pas d'administrateur (visiteur, e-mail saisi…). */
  actorName?: string;
  action: string;
  category: ActivityCategory;
  summary: string;
  link?: string;
};

/**
 * Enregistre une activité et notifie tous les administrateurs, sauf son auteur.
 * Ne bloque jamais l'action principale : une erreur est seulement journalisée.
 */
export async function logActivity(entry: Entry) {
  try {
    const ip = await clientIp().catch(() => null);
    const [activity] = await db
      .insert(schema.activities)
      .values({
        actorId: entry.actor?.id ?? null,
        actorName: entry.actor?.name ?? entry.actorName ?? "Visiteur du site",
        action: entry.action,
        category: entry.category,
        summary: entry.summary.slice(0, 300),
        link: entry.link ?? null,
        ip,
      })
      .returning({ id: schema.activities.id });

    const recipients = await db
      .select({ id: schema.admins.id })
      .from(schema.admins)
      .where(entry.actor ? ne(schema.admins.id, entry.actor.id) : undefined);
    if (recipients.length) {
      await db
        .insert(schema.notifications)
        .values(recipients.map((r) => ({ adminId: r.id, activityId: activity.id })))
        .onConflictDoNothing();
    }
  } catch (err) {
    console.error("[activité] enregistrement impossible", err);
  }
}
