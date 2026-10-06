import { and, asc, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { reservationStatuses, type ReservationStatus } from "@/lib/db/schema";
import { todayISO } from "@/lib/queries";
import { deleteReservation, saveReservationNote, setReservationStatus } from "./actions";
import { StatusPill, formatDate, statusLabels } from "./ui";

export const metadata: Metadata = { title: "Réservations" };

export default async function ReservationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statut = reservationStatuses.includes(sp.statut as ReservationStatus) ? (sp.statut as ReservationStatus) : undefined;
  const passees = sp.periode === "passees";
  const today = todayISO();

  const where: SQL[] = [passees ? lt(schema.reservations.date, today) : gte(schema.reservations.date, today)];
  if (statut) where.push(eq(schema.reservations.status, statut));
  const rows = await db
    .select()
    .from(schema.reservations)
    .where(and(...where))
    .orderBy(
      passees ? desc(schema.reservations.date) : asc(schema.reservations.date),
      asc(schema.reservations.time),
      desc(schema.reservations.id),
    )
    .limit(200);

  const qs = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { statut, periode: passees ? "passees" : undefined, ...p };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/reservations${s ? `?${s}` : ""}`;
  };
  const back = qs({});

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Réservations</h1>
          <p>Demandes envoyées depuis le formulaire du site. Rappelez le client puis confirmez.</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      <div className="subnav">
        <Link href={qs({ periode: undefined })} className={!passees ? "is-active" : undefined}>
          À venir
        </Link>
        <Link href={qs({ periode: "passees" })} className={passees ? "is-active" : undefined}>
          Passées
        </Link>
        <span style={{ width: 16 }} />
        <Link href={qs({ statut: undefined })} className={!statut ? "is-active" : undefined}>
          Tous statuts
        </Link>
        {reservationStatuses.map((s) => (
          <Link key={s} href={qs({ statut: s })} className={statut === s ? "is-active" : undefined}>
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      <div className="acard acard--flush">
        {rows.length === 0 ? (
          <div className="empty">Aucune réservation.</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Pers.</th>
                  <th>Détails</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <strong>{formatDate(r.date)}</strong>
                      <div className="muted">{r.time}</div>
                    </td>
                    <td>
                      {r.name}
                      <div className="muted">
                        <a href={`tel:${r.phone.replace(/\s/g, "")}`}>{r.phone}</a>
                        {r.email && (
                          <>
                            <br />
                            {r.email}
                          </>
                        )}
                      </div>
                    </td>
                    <td>{r.guests}</td>
                    <td style={{ maxWidth: 320 }}>
                      {r.area && <div className="muted">Espace : {r.area}</div>}
                      {r.occasion && <div className="muted">Occasion : {r.occasion}</div>}
                      {r.notes && <div style={{ fontSize: 13 }}>« {r.notes} »</div>}
                      {r.adminNote && <div className="muted">📝 {r.adminNote}</div>}
                      <details className="inline-edit">
                        <summary>{r.adminNote ? "Modifier la note" : "Ajouter une note interne"}</summary>
                        <form action={saveReservationNote} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="back" value={back} />
                          <input className="inline-input" name="adminNote" defaultValue={r.adminNote ?? ""} />
                          <SubmitButton small variant="ghost">
                            OK
                          </SubmitButton>
                        </form>
                      </details>
                      <div className="muted" style={{ marginTop: 4 }}>
                        Reçue le {r.createdAt.toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {(["confirmee", "annulee", "en_attente"] as const)
                          .filter((s) => s !== r.status)
                          .map((s) => (
                            <form key={s} action={setReservationStatus}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="back" value={back} />
                              <input type="hidden" name="status" value={s} />
                              <SubmitButton small variant={s === "confirmee" ? "primary" : "ghost"}>
                                {s === "confirmee" ? "Confirmer" : s === "annulee" ? "Annuler" : "En attente"}
                              </SubmitButton>
                            </form>
                          ))}
                        <form action={deleteReservation}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="back" value={back} />
                          <SubmitButton small variant="danger" confirm="Supprimer définitivement cette réservation ?">
                            Supprimer
                          </SubmitButton>
                        </form>
                      </div>
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
