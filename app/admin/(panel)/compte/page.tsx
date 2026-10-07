import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Avatar from "@/components/admin/Avatar";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import ImageInput from "@/components/admin/ImageInput";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { cancelPasswordRequest, removeAvatar, requestPasswordChange, updateAvatar, updateProfile } from "./actions";

export const metadata: Metadata = { title: "Mon compte" };

const statusText = {
  en_attente: "En attente de validation par un autre administrateur.",
  acceptee: "Validée : consultez votre boîte e-mail pour choisir votre nouveau mot de passe.",
  refusee: "Refusée par un administrateur.",
  utilisee: "Terminée : mot de passe modifié.",
} as const;

export default async function AccountPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const [last] = await db
    .select({ status: schema.passwordResets.status, createdAt: schema.passwordResets.createdAt })
    .from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.adminId, me.id)))
    .orderBy(desc(schema.passwordResets.createdAt))
    .limit(1);
  const pending = last?.status === "en_attente";

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Mon compte</h1>
          <p>
            {me.email} · {me.role === "superadmin" ? "Superadmin" : "Administrateur"}
          </p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <div className="acard">
        <h2>Photo de profil</h2>
        <div className="profile-photo">
          <Avatar name={me.name} src={me.avatar} size={96} />
          <form action={updateAvatar} className="profile-photo__form">
            <ImageInput name="avatar" required />
            <small className="muted">JPEG, PNG ou WebP. La photo est recadrée en cercle.</small>
            <div className="row-actions" style={{ justifyContent: "flex-start" }}>
              <SubmitButton>Enregistrer la photo</SubmitButton>
            </div>
          </form>
          {me.avatar && (
            <ConfirmAction
              action={removeAvatar}
              as="button"
              label="Supprimer la photo"
              title="Supprimer la photo de profil ?"
              message="Vos initiales seront affichées à la place."
              confirmLabel="Supprimer"
            />
          )}
        </div>
      </div>

      <div className="acard">
        <h2>Profil</h2>
        <form action={updateProfile} className="aform">
          <div className="afield">
            <label htmlFor="name">Nom</label>
            <input id="name" name="name" defaultValue={me.name} required minLength={2} />
          </div>
          <div className="afield">
            <label>E-mail</label>
            <input value={me.email} disabled />
          </div>
          <div className="form-foot">
            <SubmitButton>Enregistrer</SubmitButton>
          </div>
        </form>
      </div>

      <div className="acard">
        <h2>Mot de passe</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Pour des raisons de sécurité, un changement de mot de passe doit être validé par un autre administrateur. Une fois
          la demande acceptée, vous recevrez un e-mail avec un lien pour choisir et confirmer votre nouveau mot de passe.
        </p>
        {last && (
          <p className={`reset-status reset-status--${last.status}`}>
            Dernière demande du {last.createdAt.toLocaleDateString("fr-FR")} : {statusText[last.status]}
          </p>
        )}
        <div className="row-actions" style={{ justifyContent: "flex-start" }}>
          {pending ? (
            <form action={cancelPasswordRequest}>
              <SubmitButton variant="ghost">Annuler ma demande</SubmitButton>
            </form>
          ) : (
            <form action={requestPasswordChange}>
              <SubmitButton>Demander un changement de mot de passe</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
