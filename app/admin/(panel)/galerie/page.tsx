import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import Flash from "@/components/admin/Flash";
import MultiImageInput from "@/components/admin/MultiImageInput";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { photoCategories } from "@/lib/db/schema";
import { addPhotos, deletePhoto, movePhoto, updatePhoto } from "./actions";

export const metadata: Metadata = { title: "Galerie" };

export default async function GalleryAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.photos).orderBy(asc(schema.photos.position), asc(schema.photos.id));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Galerie</h1>
          <p>
            {rows.length} photos. Les 8 premières s&apos;affichent sur la page d&apos;accueil.
          </p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <div className="acard">
        <h2>Ajouter des photos</h2>
        <form action={addPhotos} className="aform aform--3">
          <div className="afield">
            <label>Photos *</label>
            <MultiImageInput name="files" />
          </div>
          <div className="afield">
            <label>Légende</label>
            <input name="alt" placeholder="Ex. Terrasse au coucher du soleil" maxLength={150} />
          </div>
          <div className="afield">
            <label>Catégorie</label>
            <select name="category" defaultValue="Terrasses">
              {photoCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-foot">
            <SubmitButton>Ajouter à la galerie</SubmitButton>
          </div>
        </form>
      </div>

      <div className="photo-grid">
        {rows.map((p, i) => (
          <div className="photo-card" key={p.id}>
            <div className="photo-card__img">
              <Image src={p.src} alt={p.alt} fill sizes="240px" />
            </div>
            <div className="photo-card__body">
              <form action={updatePhoto} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input type="hidden" name="id" value={p.id} />
                <input className="inline-input" name="alt" defaultValue={p.alt} required maxLength={150} aria-label="Légende" />
                <div style={{ display: "flex", gap: 6 }}>
                  <select className="inline-input" name="category" defaultValue={p.category} aria-label="Catégorie">
                    {photoCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <SubmitButton small variant="ghost">
                    OK
                  </SubmitButton>
                </div>
              </form>
              <div className="photo-card__actions">
                {i > 0 && (
                  <form action={movePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="up" />
                    <SubmitButton small variant="ghost">
                      ←
                    </SubmitButton>
                  </form>
                )}
                {i < rows.length - 1 && (
                  <form action={movePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="down" />
                    <SubmitButton small variant="ghost">
                      →
                    </SubmitButton>
                  </form>
                )}
                <form action={deletePhoto} style={{ marginLeft: "auto" }}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton small variant="danger" confirm="Retirer cette photo de la galerie ?">
                    Supprimer
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
