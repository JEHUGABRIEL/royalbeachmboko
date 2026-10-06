import type { Metadata } from "next";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { changePassword, updateProfile } from "./actions";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const me = await requireAdmin();
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Mon compte</h1>
          <p>{me.email}</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      <div className="acard">
        <h2>Profil</h2>
        <form action={updateProfile} className="aform">
          <div className="afield">
            <label>Nom</label>
            <input name="name" defaultValue={me.name} required minLength={2} />
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
        <form action={changePassword} className="aform aform--3">
          <div className="afield">
            <label>Mot de passe actuel</label>
            <input name="current" type="password" autoComplete="current-password" required />
          </div>
          <div className="afield">
            <label>Nouveau mot de passe</label>
            <input name="password" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          <div className="afield">
            <label>Confirmer</label>
            <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          <div className="form-foot">
            <SubmitButton>Changer le mot de passe</SubmitButton>
          </div>
        </form>
      </div>
    </>
  );
}
