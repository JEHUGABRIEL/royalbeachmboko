import type { Metadata } from "next";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { getSettings } from "@/lib/queries";
import { saveSettings } from "./actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Infos & horaires" };

export default async function SettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const s = await getSettings();
  const groups = [...s.hours, ...Array(Math.max(0, 4 - s.hours.length)).fill({ days: "", slots: [] })].slice(0, 4);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Infos & horaires</h1>
          <p>Coordonnées et horaires affichés dans l&apos;en-tête, le pied de page, la page Contact et la carte.</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      <form action={saveSettings}>
        <div className="acard">
          <h2>Coordonnées</h2>
          <div className="aform">
            <div className="afield">
              <label>Téléphone *</label>
              <input name="phone" required defaultValue={s.phone} />
            </div>
            <div className="afield">
              <label>WhatsApp</label>
              <input name="whatsapp" defaultValue={s.whatsapp} />
              <small>Numéro au format international, ex. +236 72 00 00 00.</small>
            </div>
            <div className="afield">
              <label>E-mail</label>
              <input name="email" type="email" defaultValue={s.email} />
            </div>
            <div className="afield">
              <label>Adresse *</label>
              <input name="address" required defaultValue={s.address} />
            </div>
            <div className="afield afield--full">
              <label>Recherche pour la carte Google</label>
              <input name="mapQuery" defaultValue={s.mapQuery} />
              <small>Ce qui est recherché sur Google Maps pour placer le restaurant (nom du lieu ou coordonnées GPS « 4.33, 18.52 »).</small>
            </div>
            <div className="afield">
              <label>Page Facebook</label>
              <input name="facebook" defaultValue={s.facebook} placeholder="https://facebook.com/…" />
            </div>
            <div className="afield">
              <label>Compte Instagram</label>
              <input name="instagram" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
            </div>
          </div>
        </div>

        <div className="acard">
          <h2>Horaires d&apos;ouverture</h2>
          <div className="aform">
            {groups.map((g, i) => (
              <div key={i} className="afield" style={{ gap: 8 }}>
                <label>Jours (groupe {i + 1})</label>
                <input name={`days_${i}`} defaultValue={g.days} placeholder="Lundi — Vendredi" />
                <textarea
                  name={`slots_${i}`}
                  defaultValue={g.slots.join("\n")}
                  placeholder={"10h — 15h (Déjeuner)\n18h — 23h (Dîner)"}
                  rows={3}
                />
                <small>Un créneau par ligne. Laissez vide pour ne pas afficher ce groupe.</small>
              </div>
            ))}
          </div>
        </div>
        <div className="form-foot">
          <SubmitButton>Enregistrer</SubmitButton>
        </div>
      </form>
    </>
  );
}
