import { asc, desc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ActionMenu from "@/components/admin/ActionMenu";
import Avatar from "@/components/admin/Avatar";
import ConfirmAction from "@/components/admin/ConfirmAction";
import CopyLink from "@/components/admin/CopyLink";
import Flash from "@/components/admin/Flash";
import IconButton from "@/components/admin/IconButton";
import Modal, { ModalCancel } from "@/components/admin/Modal";
import SubmitButton from "@/components/admin/SubmitButton";
import { LINK_COOKIE, type PageProps } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { approveReset, cancelInvitation, inviteAdmin, refuseReset, removeAdmin, resendInvitation } from "./actions";

export const metadata: Metadata = { title: "Administrateurs" };

const decider = alias(schema.admins, "decider");

const resetLabels = {
  en_attente: { text: "En attente", pill: "en_attente" },
  acceptee: { text: "Validée — lien envoyé", pill: "confirmee" },
  refusee: { text: "Refusée", pill: "annulee" },
  utilisee: { text: "Terminée", pill: "off" },
} as const;

export default async function AdminsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const [admins, invites, resets] = await Promise.all([
    db.select().from(schema.admins).orderBy(asc(schema.admins.createdAt)),
    db
      .select({
        id: schema.invitations.id,
        email: schema.invitations.email,
        expiresAt: schema.invitations.expiresAt,
        invitedBy: schema.admins.name,
      })
      .from(schema.invitations)
      .leftJoin(schema.admins, eq(schema.admins.id, schema.invitations.invitedBy))
      .where(isNull(schema.invitations.acceptedAt))
      .orderBy(asc(schema.invitations.createdAt)),
    db
      .select({
        id: schema.passwordResets.id,
        status: schema.passwordResets.status,
        origin: schema.passwordResets.origin,
        createdAt: schema.passwordResets.createdAt,
        decidedAt: schema.passwordResets.decidedAt,
        adminId: schema.admins.id,
        name: schema.admins.name,
        email: schema.admins.email,
        avatar: schema.admins.avatar,
        decidedBy: decider.name,
      })
      .from(schema.passwordResets)
      .innerJoin(schema.admins, eq(schema.admins.id, schema.passwordResets.adminId))
      .leftJoin(decider, eq(decider.id, schema.passwordResets.decidedBy))
      .orderBy(desc(schema.passwordResets.createdAt))
      .limit(10),
  ]);

  let manual: { kind?: "invitation" | "reinitialisation"; email: string; link: string } | null = null;
  try {
    const raw = (await cookies()).get(LINK_COOKIE)?.value;
    manual = raw ? JSON.parse(raw) : null;
  } catch {}

  const now = new Date();
  const isSuper = me.role === "superadmin";
  const pendingResets = resets.filter((r) => r.status === "en_attente").length;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Administrateurs</h1>
          <p>Personnes ayant accès au back-office, invitations et demandes de réinitialisation.</p>
        </div>
        <Modal title="Inviter un administrateur" trigger={{ kind: "button", label: "Inviter", icon: "plus" }}>
          <form action={inviteAdmin} className="aform aform--1">
            <div className="afield">
              <label htmlFor="invite-email">Adresse e-mail</label>
              <input id="invite-email" name="email" type="email" required placeholder="adresse@exemple.com" autoFocus />
              <small>La personne reçoit un e-mail avec un lien (valable 7 jours) pour choisir son nom et son mot de passe.</small>
            </div>
            <div className="modal__foot">
              <ModalCancel />
              <SubmitButton>Envoyer l&apos;invitation</SubmitButton>
            </div>
          </form>
        </Modal>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      {manual && sp.ok && (
        <div className="acard">
          <strong>
            {manual.kind === "reinitialisation" ? "Lien de réinitialisation" : "Lien d'invitation"} pour {manual.email}
          </strong>
          <div className="muted">
            À envoyer par WhatsApp ou SMS. Utilisable une seule fois, valable{" "}
            {manual.kind === "reinitialisation" ? "24 heures" : "7 jours"}.
          </div>
          <CopyLink link={manual.link} />
        </div>
      )}

      <div className="acard acard--flush" id="reinitialisations">
        <div className="cat-head">
          <h2>
            Demandes de réinitialisation {pendingResets > 0 && <span className="pill pill--en_attente">{pendingResets} en attente</span>}
          </h2>
        </div>
        {resets.length === 0 ? (
          <div className="empty">Aucune demande de réinitialisation.</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Administrateur</th>
                  <th>Origine</th>
                  <th>Statut</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resets.map((r) => {
                  const label = resetLabels[r.status];
                  const own = r.adminId === me.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="who">
                          <Avatar name={r.name} src={r.avatar} />
                          <div>
                            <strong>{r.name}</strong>
                            <div className="muted">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {r.origin === "connexion" ? "Mot de passe oublié" : "Depuis Mon compte"}
                        <div className="muted">
                          {r.createdAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </td>
                      <td>
                        <span className={`pill pill--${label.pill}`}>{label.text}</span>
                        {r.decidedBy && <div className="muted">par {r.decidedBy}</div>}
                      </td>
                      <td className="td-actions">
                        {r.status === "en_attente" &&
                          (own ? (
                            <span className="muted">À valider par un autre administrateur</span>
                          ) : (
                            <ActionMenu>
                              <form action={approveReset}>
                                <input type="hidden" name="id" value={r.id} />
                                <IconButton icon="check" label="Accepter et envoyer le lien" tone="success" />
                              </form>
                              <ConfirmAction
                                action={refuseReset}
                                fields={{ id: r.id }}
                                icon="x"
                                label="Refuser"
                                title="Refuser la demande ?"
                                message={
                                  <>
                                    <strong>{r.name}</strong> ne recevra pas de lien de réinitialisation.
                                  </>
                                }
                                confirmLabel="Refuser"
                              />
                            </ActionMenu>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div className="acard acard--flush">
          <div className="cat-head">
            <h2>Invitations en attente</h2>
          </div>
          <div className="table-wrap">
            <table className="atable">
              <tbody>
                {invites.map((inv) => {
                  const expired = inv.expiresAt < now;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong>{inv.email}</strong>
                        <div className="muted">
                          {inv.invitedBy ? `Invité par ${inv.invitedBy} · ` : ""}
                          {expired ? "Expirée" : `Expire le ${inv.expiresAt.toLocaleDateString("fr-FR")}`}
                        </div>
                      </td>
                      <td className="td-actions">
                        <ActionMenu>
                          <form action={resendInvitation}>
                            <input type="hidden" name="id" value={inv.id} />
                            <IconButton icon="refresh" label="Renvoyer l'invitation" />
                          </form>
                          <ConfirmAction
                            action={cancelInvitation}
                            fields={{ id: inv.id }}
                            icon="x"
                            label="Annuler l'invitation"
                            title="Annuler l'invitation ?"
                            message={
                              <>
                                Le lien envoyé à <strong>{inv.email}</strong> ne fonctionnera plus.
                              </>
                            }
                            confirmLabel="Annuler l'invitation"
                          />
                        </ActionMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="acard acard--flush">
        <div className="cat-head">
          <h2>Comptes actifs ({admins.length})</h2>
        </div>
        <div className="table-wrap">
          <table className="atable">
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="who">
                      <Avatar name={a.name} src={a.avatar} size={36} />
                      <div>
                        <strong>{a.name}</strong> {a.id === me.id && <span className="pill pill--confirmee">Vous</span>}
                        <div className="muted">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${a.role === "superadmin" ? "pill--super" : "pill--off"}`}>
                      {a.role === "superadmin" ? "Superadmin" : "Administrateur"}
                    </span>
                  </td>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>
                    Depuis le {a.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="td-actions">
                    {isSuper && a.id !== me.id && a.role !== "superadmin" && (
                      <ActionMenu>
                        <ConfirmAction
                          action={removeAdmin}
                          fields={{ id: a.id }}
                          icon="userMinus"
                          label="Retirer l'accès"
                          title="Retirer l'accès ?"
                          message={
                            <>
                              <strong>{a.name}</strong> ({a.email}) ne pourra plus se connecter au back-office.
                            </>
                          }
                          confirmLabel="Retirer l'accès"
                        />
                      </ActionMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isSuper && <p className="muted" style={{ padding: "0 20px 16px" }}>Seul le superadmin peut retirer un accès.</p>}
      </div>
    </>
  );
}
