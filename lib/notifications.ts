import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "./db";

export type NotificationItem = {
  id: number;
  summary: string;
  actorName: string;
  category: string;
  link: string | null;
  createdAt: string;
  read: boolean;
};

export async function unreadCount(adminId: number) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.adminId, adminId), isNull(schema.notifications.readAt)));
  return n;
}

export async function latestNotifications(adminId: number, limit = 12): Promise<NotificationItem[]> {
  const rows = await db
    .select({
      id: schema.notifications.id,
      readAt: schema.notifications.readAt,
      summary: schema.activities.summary,
      actorName: schema.activities.actorName,
      actorId: schema.activities.actorId,
      category: schema.activities.category,
      link: schema.activities.link,
      createdAt: schema.activities.createdAt,
    })
    .from(schema.notifications)
    .innerJoin(schema.activities, eq(schema.activities.id, schema.notifications.activityId))
    .where(eq(schema.notifications.adminId, adminId))
    .orderBy(desc(schema.activities.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    // Les actions d'un administrateur sont rédigées « a fait… » : on préfixe son nom.
    summary: r.actorId ? `${r.actorName} ${r.summary}` : r.summary,
    actorName: r.actorName,
    category: r.category,
    link: r.link,
    createdAt: r.createdAt.toISOString(),
    read: r.readAt !== null,
  }));
}

export async function markRead(adminId: number, id?: number) {
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.adminId, adminId),
        isNull(schema.notifications.readAt),
        id ? eq(schema.notifications.id, id) : undefined,
      ),
    );
}
