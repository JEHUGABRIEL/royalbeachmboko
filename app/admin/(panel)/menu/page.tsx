import { asc, count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import IconButton from "@/components/admin/IconButton";
import Modal, { ModalCancel } from "@/components/admin/Modal";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { createCategory, deleteCategory, moveCategory, renameCategory } from "./actions";

export const metadata: Metadata = { title: "Catégories du menu" };

export default async function CategoriesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cats = await db
    .select({
      id: schema.menuCategories.id,
      slug: schema.menuCategories.slug,
      label: schema.menuCategories.label,
      items: count(schema.menuItems.id),
    })
    .from(schema.menuCategories)
    .leftJoin(schema.menuItems, eq(schema.menuItems.categoryId, schema.menuCategories.id))
    .groupBy(schema.menuCategories.id)
    .orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Catégories du menu</h1>
          <p>Chaque catégorie est un onglet de la carte sur le site, dans cet ordre.</p>
        </div>
        <Modal title="Nouvelle catégorie" trigger={{ kind: "button", label: "Nouvelle catégorie", icon: "plus" }}>
          <form action={createCategory} className="aform aform--1">
            <div className="afield">
              <label htmlFor="cat-label">Nom</label>
              <input id="cat-label" name="label" placeholder="Ex. Desserts" required maxLength={60} autoFocus />
            </div>
            <div className="modal__foot">
              <ModalCancel />
              <SubmitButton>Créer</SubmitButton>
            </div>
          </form>
        </Modal>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <div className="acard acard--flush">
        {cats.length === 0 ? (
          <div className="empty">Créez une première catégorie (ex. Plats, Boissons).</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Plats</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/menu/${c.slug}`} className="strong-link">
                        {c.label}
                      </Link>
                    </td>
                    <td>{c.items}</td>
                    <td>
                      <div className="row-actions">
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="dir" value="up" />
                          {i > 0 ? <IconButton icon="up" label="Monter" /> : <span className="ibtn-spacer" />}
                        </form>
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="dir" value="down" />
                          {i < cats.length - 1 ? <IconButton icon="down" label="Descendre" /> : <span className="ibtn-spacer" />}
                        </form>
                        <Modal title="Renommer la catégorie" trigger={{ kind: "icon", icon: "edit", label: "Renommer" }}>
                          <form action={renameCategory} className="aform aform--1">
                            <input type="hidden" name="id" value={c.id} />
                            <div className="afield">
                              <label htmlFor={`cat-${c.id}`}>Nom</label>
                              <input id={`cat-${c.id}`} name="label" defaultValue={c.label} required maxLength={60} autoFocus />
                            </div>
                            <div className="modal__foot">
                              <ModalCancel />
                              <SubmitButton>Enregistrer</SubmitButton>
                            </div>
                          </form>
                        </Modal>
                        <ConfirmAction
                          action={deleteCategory}
                          fields={{ id: c.id }}
                          label="Supprimer"
                          title="Supprimer la catégorie ?"
                          message={
                            <>
                              La catégorie <strong>{c.label}</strong> et ses {c.items} plat(s) seront définitivement
                              supprimés.
                            </>
                          }
                          confirmLabel="Supprimer"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
