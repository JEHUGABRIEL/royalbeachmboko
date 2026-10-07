import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import Flash from "@/components/admin/Flash";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";
import { StatusPill, formatDate } from "./reservations/ui";
import { requireAdmin } from "@/lib/auth";

export default async function Dashboard({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok } = await searchParams;
  const today = todayISO();
  const [[pending], [todayCount], [unread], [upcomingEvents], next] = await Promise.all([
    db.select({ n: count() }).from(schema.reservations).where(eq(schema.reservations.status, "en_attente")),
    db
      .select({ n: count() })
      .from(schema.reservations)
      .where(and(eq(schema.reservations.date, today), eq(schema.reservations.status, "confirmee"))),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.read, false)),
    db
      .select({ n: count() })
      .from(schema.events)
      .where(and(eq(schema.events.published, true), gte(schema.events.date, today))),
    db
      .select()
      .from(schema.reservations)
      .where(gte(schema.reservations.date, today))
      .orderBy(asc(schema.reservations.date), asc(schema.reservations.time), desc(schema.reservations.id))
      .limit(8),
  ]);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d&apos;ensemble de l&apos;activité du restaurant.</p>
        </div>
      </div>
      <Flash ok={ok} />
      <div className="stats">
        <Link href="/admin/reservations?statut=en_attente" className="stat stat--accent">
          <div className="stat__value">{pending.n}</div>
          <div className="stat__label">Réservations à confirmer</div>
        </Link>
        <div className="stat">
          <div className="stat__value">{todayCount.n}</div>
          <div className="stat__label">Tables confirmées aujourd&apos;hui</div>
        </div>
        <Link href="/admin/messages" className="stat">
          <div className="stat__value">{unread.n}</div>
          <div className="stat__label">Messages non lus</div>
        </Link>
        <Link href="/admin/evenements" className="stat">
          <div className="stat__value">{upcomingEvents.n}</div>
          <div className="stat__label">Événements à venir</div>
        </Link>
      </div>

      <div className="acard acard--flush">
        <div className="cat-head">
          <h2>Prochaines réservations</h2>
          <Link href="/admin/reservations" className="abtn abtn--ghost abtn--sm">
            Tout voir
          </Link>
        </div>
        {next.length === 0 ? (
          <div className="empty">Aucune réservation à venir.</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Pers.</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {next.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {formatDate(r.date)} · {r.time}
                    </td>
                    <td>
                      {r.name}
                      <div className="muted">{r.phone}</div>
                    </td>
                    <td>{r.guests}</td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
