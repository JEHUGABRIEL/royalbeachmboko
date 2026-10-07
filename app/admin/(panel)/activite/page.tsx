import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import Avatar from "@/components/admin/Avatar";
import Flash from "@/components/admin/Flash";
import Pagination from "@/components/admin/Pagination";
import { activityCategories, type ActivityCategory } from "@/lib/activity";
import { pageParam, type PageProps } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Activité" };

const PER_PAGE = 25;

export default async function ActivityPage({ searchParams }: PageProps) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const type = sp.type && sp.type in activityCategories ? (sp.type as ActivityCategory) : undefined;
  const where = type ? eq(schema.activities.category, type) : undefined;

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(schema.activities).where(where),
    db
      .select({
        id: schema.activities.id,
        actorId: schema.activities.actorId,
        actorName: schema.activities.actorName,
        avatar: schema.admins.avatar,
        category: schema.activities.category,
        summary: schema.activities.summary,
        link: schema.activities.link,
        ip: schema.activities.ip,
        createdAt: schema.activities.createdAt,
      })
      .from(schema.activities)
      .leftJoin(schema.admins, eq(schema.admins.id, schema.activities.actorId))
      .where(where)
      .orderBy(desc(schema.activities.createdAt), desc(schema.activities.id))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
  ]);

  const href = (t?: string) => (t ? `/admin/activite?type=${t}` : "/admin/activite");

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Activité</h1>
          <p>Tout ce qui se passe sur le site et dans le back-office : connexions, ajouts, modifications, suppressions…</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      <div className="subnav">
        <Link href={href()} className={!type ? "is-active" : undefined}>
          Tout
        </Link>
        {Object.entries(activityCategories).map(([key, label]) => (
          <Link key={key} href={href(key)} className={type === key ? "is-active" : undefined}>
            {label}
          </Link>
        ))}
      </div>

      <div className="acard acard--flush">
        {rows.length === 0 ? (
          <div className="empty">Aucune activité enregistrée.</div>
        ) : (
          <ul className="timeline">
            {rows.map((a) => {
              const text = a.actorId ? `${a.actorName} ${a.summary}` : a.summary;
              return (
                <li key={a.id} className="timeline__item">
                  <Avatar name={a.actorName} src={a.avatar} size={34} />
                  <div className="timeline__body">
                    <p>{a.link ? <Link href={a.link}>{text}</Link> : text}</p>
                    <span className="muted">
                      {a.createdAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                      {activityCategories[a.category as ActivityCategory] ?? a.category}
                      {!a.actorId && " · hors connexion"}
                      {me.role === "superadmin" && a.ip && ` · IP ${a.ip}`}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} path="/admin/activite" params={{ type }} />
    </>
  );
}
