import ImageInput from "@/components/admin/ImageInput";
import type { schema } from "@/lib/db";

type Event = typeof schema.events.$inferSelect;

export default function EventFields({ event, today }: { event?: Event; today: string }) {
  const id = event?.id ?? "new";
  return (
    <>
      <div className="afield afield--full">
        <label htmlFor={`ev-title-${id}`}>Titre *</label>
        <input id={`ev-title-${id}`} name="title" required defaultValue={event?.title} maxLength={120} placeholder="Soirée coucher de soleil" />
      </div>
      <div className="afield">
        <label htmlFor={`ev-date-${id}`}>Date *</label>
        <input id={`ev-date-${id}`} name="date" type="date" required defaultValue={event?.date ?? today} />
      </div>
      <div className="afield">
        <label htmlFor={`ev-time-${id}`}>Horaires *</label>
        <input id={`ev-time-${id}`} name="time" required defaultValue={event?.time} placeholder="17h00 — 23h00" />
      </div>
      <div className="afield afield--full">
        <label htmlFor={`ev-place-${id}`}>Lieu *</label>
        <input id={`ev-place-${id}`} name="place" required defaultValue={event?.place} placeholder="Ponton Royal Beach" />
      </div>
      <div className="afield afield--full">
        <label htmlFor={`ev-desc-${id}`}>Description</label>
        <textarea id={`ev-desc-${id}`} name="description" defaultValue={event?.description} maxLength={600} />
      </div>
      <div className="afield">
        <label>Image {!event && "*"}</label>
        <ImageInput name="image" required={!event} current={event?.image} />
        {event && <small>Choisissez un fichier uniquement pour remplacer l&apos;image actuelle.</small>}
      </div>
      <div className="afield" style={{ justifyContent: "flex-end" }}>
        <label className="check">
          <input type="checkbox" name="published" defaultChecked={event?.published ?? true} /> Publié sur le site
        </label>
      </div>
    </>
  );
}
