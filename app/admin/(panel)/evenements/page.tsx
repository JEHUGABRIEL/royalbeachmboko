import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";
import { formatDate } from "../reservations/ui";
import { deleteEvent } from "./actions";

export const metadata: Metadata = { title: "Événements" };

export default async function EventsAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const today = todayISO();
  const rows = await db.select().from(schema.events).orderBy(desc(schema.events.date));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Événements</h1>
          <p>Seuls les événements publiés et à venir apparaissent sur le site.</p>
        </div>
        <Link href="/admin/evenements/nouveau" className="abtn abtn--primary">
          + Nouvel événement
        </Link>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      <div className="acard acard--flush">
        {rows.length === 0 ? (
          <div className="empty">Aucun événement.</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th />
                  <th>Événement</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const past = e.date < today;
                  return (
                    <tr key={e.id} style={past ? { opacity: 0.55 } : undefined}>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.image} alt="" className="thumb" />
                      </td>
                      <td>
                        <strong>{e.title}</strong>
                        <div className="muted">{e.place}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDate(e.date)}
                        <div className="muted">{e.time}</div>
                      </td>
                      <td>
                        {past ? (
                          <span className="pill pill--off">Passé</span>
                        ) : e.published ? (
                          <span className="pill pill--confirmee">Publié</span>
                        ) : (
                          <span className="pill pill--en_attente">Brouillon</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link href={`/admin/evenements/${e.id}`} className="abtn abtn--ghost abtn--sm">
                            Modifier
                          </Link>
                          <form action={deleteEvent}>
                            <input type="hidden" name="id" value={e.id} />
                            <SubmitButton small variant="danger" confirm={`Supprimer « ${e.title} » ?`}>
                              Supprimer
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
