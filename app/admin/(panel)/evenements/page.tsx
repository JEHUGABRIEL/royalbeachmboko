import { count, desc } from "drizzle-orm";
import type { Metadata } from "next";
import ActionMenu from "@/components/admin/ActionMenu";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import Modal, { ModalCancel } from "@/components/admin/Modal";
import Pagination from "@/components/admin/Pagination";
import SubmitButton from "@/components/admin/SubmitButton";
import { pageParam, type PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";
import { formatDate } from "../reservations/ui";
import { deleteEvent, saveEvent } from "./actions";
import EventFields from "./EventFields";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Événements" };

const PER_PAGE = 10;

export default async function EventsAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const today = todayISO();
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(schema.events),
    db
      .select()
      .from(schema.events)
      .orderBy(desc(schema.events.date))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
  ]);
  const back = page > 1 ? `/admin/evenements?page=${page}` : "/admin/evenements";

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Événements</h1>
          <p>Seuls les événements publiés et à venir apparaissent sur le site.</p>
        </div>
        <Modal title="Nouvel événement" trigger={{ kind: "button", label: "Nouvel événement", icon: "plus" }} wide>
          <form action={saveEvent} className="aform">
            <input type="hidden" name="back" value="/admin/evenements" />
            <EventFields today={today} />
            <div className="modal__foot">
              <ModalCancel />
              <SubmitButton>Créer l&apos;événement</SubmitButton>
            </div>
          </form>
        </Modal>
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
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const past = e.date < today;
                  return (
                    <tr key={e.id} className={past ? "row--muted" : undefined}>
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
                      <td className="td-actions">
                        <ActionMenu>
                          <Modal title={`Modifier « ${e.title} »`} trigger={{ kind: "icon", icon: "edit", label: "Modifier" }} wide>
                            <form action={saveEvent} className="aform">
                              <input type="hidden" name="id" value={e.id} />
                              <input type="hidden" name="back" value={back} />
                              <EventFields event={e} today={today} />
                              <div className="modal__foot">
                                <ModalCancel />
                                <SubmitButton>Enregistrer</SubmitButton>
                              </div>
                            </form>
                          </Modal>
                          <ConfirmAction
                            action={deleteEvent}
                            fields={{ id: e.id, back }}
                            label="Supprimer"
                            title="Supprimer l'événement ?"
                            message={
                              <>
                                <strong>{e.title}</strong> du {formatDate(e.date)} sera définitivement supprimé, ainsi que
                                son image.
                              </>
                            }
                            confirmLabel="Supprimer"
                          />
                        </ActionMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} path="/admin/evenements" />
    </>
  );
}
