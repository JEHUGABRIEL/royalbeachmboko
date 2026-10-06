import { asc, count } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import IconButton from "@/components/admin/IconButton";
import Modal, { ModalCancel } from "@/components/admin/Modal";
import MultiImageInput from "@/components/admin/MultiImageInput";
import Pagination from "@/components/admin/Pagination";
import SubmitButton from "@/components/admin/SubmitButton";
import { pageParam, type PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { photoCategories } from "@/lib/db/schema";
import { addPhotos, deletePhoto, movePhoto, updatePhoto } from "./actions";

export const metadata: Metadata = { title: "Galerie" };

const PER_PAGE = 24;

export default async function GalleryAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(schema.photos),
    db
      .select()
      .from(schema.photos)
      .orderBy(asc(schema.photos.position), asc(schema.photos.id))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
  ]);
  const back = page > 1 ? `/admin/galerie?page=${page}` : "/admin/galerie";
  const first = (page - 1) * PER_PAGE;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Galerie</h1>
          <p>{total} photos. Les 8 premières s&apos;affichent sur la page d&apos;accueil.</p>
        </div>
        <Modal title="Ajouter des photos" trigger={{ kind: "button", label: "Ajouter des photos", icon: "plus" }} wide>
          <form action={addPhotos} className="aform">
            <div className="afield afield--full">
              <label>Photos * (8 maximum par envoi)</label>
              <MultiImageInput name="files" />
            </div>
            <div className="afield">
              <label htmlFor="ph-alt">Légende</label>
              <input id="ph-alt" name="alt" placeholder="Ex. Terrasse au coucher du soleil" maxLength={150} />
            </div>
            <div className="afield">
              <label htmlFor="ph-cat">Catégorie</label>
              <select id="ph-cat" name="category" defaultValue="Terrasses">
                {photoCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="modal__foot">
              <ModalCancel />
              <SubmitButton>Ajouter à la galerie</SubmitButton>
            </div>
          </form>
        </Modal>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      {rows.length === 0 && <div className="acard empty">La galerie est vide.</div>}
      <div className="photo-grid">
        {rows.map((p, i) => {
          const index = first + i;
          return (
            <div className="photo-card" key={p.id}>
              <div className="photo-card__img">
                <Image src={p.src} alt={p.alt} fill sizes="240px" />
                <span className="photo-card__cat">{p.category}</span>
              </div>
              <div className="photo-card__body">
                <p className="photo-card__alt">{p.alt}</p>
                <div className="row-actions" style={{ justifyContent: "space-between" }}>
                  <div className="row-actions">
                    <form action={movePhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value="up" />
                      <input type="hidden" name="back" value={back} />
                      {index > 0 ? <IconButton icon="left" label="Avancer" /> : <span className="ibtn-spacer" />}
                    </form>
                    <form action={movePhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value="down" />
                      <input type="hidden" name="back" value={back} />
                      {index < total - 1 ? <IconButton icon="right" label="Reculer" /> : <span className="ibtn-spacer" />}
                    </form>
                  </div>
                  <div className="row-actions">
                    <Modal title="Modifier la photo" trigger={{ kind: "icon", icon: "edit", label: "Modifier" }}>
                      <form action={updatePhoto} className="aform aform--1">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="back" value={back} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt="" className="modal__preview" />
                        <div className="afield">
                          <label htmlFor={`alt-${p.id}`}>Légende</label>
                          <input id={`alt-${p.id}`} name="alt" defaultValue={p.alt} required maxLength={150} />
                        </div>
                        <div className="afield">
                          <label htmlFor={`cat-${p.id}`}>Catégorie</label>
                          <select id={`cat-${p.id}`} name="category" defaultValue={p.category}>
                            {photoCategories.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="modal__foot">
                          <ModalCancel />
                          <SubmitButton>Enregistrer</SubmitButton>
                        </div>
                      </form>
                    </Modal>
                    <ConfirmAction
                      action={deletePhoto}
                      fields={{ id: p.id, back }}
                      label="Supprimer"
                      title="Supprimer la photo ?"
                      message={
                        <>
                          La photo « {p.alt} » sera retirée de la galerie du site.
                        </>
                      }
                      confirmLabel="Supprimer"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} path="/admin/galerie" />
    </>
  );
}
