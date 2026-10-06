import { asc, eq, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import CopyLink from "@/components/admin/CopyLink";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import { LINK_COOKIE, type PageProps } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { cancelInvitation, inviteAdmin, removeAdmin, resendInvitation } from "./actions";

export const metadata: Metadata = { title: "Administrateurs" };

export default async function AdminsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const [admins, invites] = await Promise.all([
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
  ]);

  let manual: { email: string; link: string } | null = null;
  try {
    const raw = (await cookies()).get(LINK_COOKIE)?.value;
    manual = raw ? JSON.parse(raw) : null;
  } catch {}

  const now = new Date();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Administrateurs</h1>
          <p>Personnes ayant accès au back-office. Invitez un nouvel administrateur par e-mail.</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      {manual && sp.ok && (
        <div className="acard">
          <strong>Lien d&apos;invitation pour {manual.email}</strong>
          <div className="muted">À envoyer par WhatsApp ou SMS. Valable 7 jours, utilisable une seule fois.</div>
          <CopyLink link={manual.link} />
        </div>
      )}

      <div className="acard">
        <h2>Inviter un administrateur</h2>
        <form action={inviteAdmin} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="inline-input" style={{ flex: 1, minWidth: 240 }} name="email" type="email" required placeholder="adresse@exemple.com" />
          <SubmitButton>Envoyer l&apos;invitation</SubmitButton>
        </form>
        <p className="muted" style={{ marginBottom: 0 }}>
          La personne reçoit un e-mail avec un lien pour choisir son nom et son mot de passe.
        </p>
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
                      <td>
                        <div className="row-actions">
                          <form action={resendInvitation}>
                            <input type="hidden" name="id" value={inv.id} />
                            <SubmitButton small variant="ghost">
                              Renvoyer
                            </SubmitButton>
                          </form>
                          <form action={cancelInvitation}>
                            <input type="hidden" name="id" value={inv.id} />
                            <SubmitButton small variant="danger" confirm={`Annuler l'invitation de ${inv.email} ?`}>
                              Annuler
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
                    <strong>{a.name}</strong> {a.id === me.id && <span className="pill pill--confirmee">Vous</span>}
                    <div className="muted">{a.email}</div>
                  </td>
                  <td className="muted">Depuis le {a.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>
                    {a.id !== me.id && (
                      <div className="row-actions">
                        <form action={removeAdmin}>
                          <input type="hidden" name="id" value={a.id} />
                          <SubmitButton small variant="danger" confirm={`Retirer l'accès de ${a.name} ?`}>
                            Retirer l&apos;accès
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
