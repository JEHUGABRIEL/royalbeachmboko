import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/admin/Flash";
import ImageInput from "@/components/admin/ImageInput";
import SubmitButton from "@/components/admin/SubmitButton";
import { db, schema } from "@/lib/db";
import { todayISO } from "@/lib/queries";
import { saveEvent } from "../actions";

export const metadata: Metadata = { title: "Événement" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function EventFormPage({ params, searchParams }: Props) {
  const { id: raw } = await params;
  const { error } = await searchParams;
  const isNew = raw === "nouveau";
  const id = Number(raw);
  if (!isNew && !Number.isInteger(id)) notFound();
  const [event] = isNew ? [] : await db.select().from(schema.events).where(eq(schema.events.id, id));
  if (!isNew && !event) notFound();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{event?.title ?? "Nouvel événement"}</h1>
          <p>
            <Link href="/admin/evenements">← Retour aux événements</Link>
          </p>
        </div>
      </div>
      <Flash error={error} />
      <div className="acard">
        <form action={saveEvent} className="aform">
          {event && <input type="hidden" name="id" value={event.id} />}
          <div className="afield afield--full">
            <label>Titre *</label>
            <input name="title" required defaultValue={event?.title} maxLength={120} placeholder="Soirée coucher de soleil" />
          </div>
          <div className="afield">
            <label>Date *</label>
            <input name="date" type="date" required defaultValue={event?.date ?? todayISO()} />
          </div>
          <div className="afield">
            <label>Horaires *</label>
            <input name="time" required defaultValue={event?.time} placeholder="17h00 — 23h00" />
          </div>
          <div className="afield afield--full">
            <label>Lieu *</label>
            <input name="place" required defaultValue={event?.place} placeholder="Ponton Royal Beach" />
          </div>
          <div className="afield afield--full">
            <label>Description</label>
            <textarea name="description" defaultValue={event?.description} maxLength={600} />
          </div>
          <div className="afield">
            <label>Image {isNew && "*"}</label>
            <ImageInput name="image" required={isNew} current={event?.image} />
            {!isNew && <small>Choisissez un fichier uniquement pour remplacer l&apos;image actuelle.</small>}
          </div>
          <div className="afield" style={{ justifyContent: "flex-end" }}>
            <label className="check">
              <input type="checkbox" name="published" defaultChecked={event?.published ?? true} /> Publié sur le site
            </label>
          </div>
          <div className="form-foot">
            <Link href="/admin/evenements" className="abtn abtn--ghost">
              Annuler
            </Link>
            <SubmitButton>Enregistrer</SubmitButton>
          </div>
        </form>
      </div>
    </>
  );
}
