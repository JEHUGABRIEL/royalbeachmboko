import { asc, count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActionMenu from "@/components/admin/ActionMenu";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import IconButton from "@/components/admin/IconButton";
import Modal, { ModalCancel } from "@/components/admin/Modal";
import Pagination from "@/components/admin/Pagination";
import SubmitButton from "@/components/admin/SubmitButton";
import { pageParam } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import { db, schema } from "@/lib/db";
import { createItem, deleteItem, moveItem, toggleItem, updateItem } from "../actions";
import ItemFields from "../ItemFields";
import { requireAdmin } from "@/lib/auth";

const PER_PAGE = 15;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cat] = await db.select().from(schema.menuCategories).where(eq(schema.menuCategories.slug, slug));
  return { title: cat ? `Menu — ${cat.label}` : "Menu" };
}

export default async function CategoryItemsPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [cat] = await db.select().from(schema.menuCategories).where(eq(schema.menuCategories.slug, slug));
  if (!cat) notFound();

  const [[{ total }], items, cats] = await Promise.all([
    db.select({ total: count() }).from(schema.menuItems).where(eq(schema.menuItems.categoryId, cat.id)),
    db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.categoryId, cat.id))
      .orderBy(asc(schema.menuItems.position), asc(schema.menuItems.id))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db
      .select({ id: schema.menuCategories.id, label: schema.menuCategories.label })
      .from(schema.menuCategories)
      .orderBy(asc(schema.menuCategories.position)),
  ]);
  const path = `/admin/menu/${cat.slug}`;
  const back = page > 1 ? `${path}?page=${page}` : path;
  const first = (page - 1) * PER_PAGE;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{cat.label}</h1>
          <p>
            {total} plat(s) dans cette catégorie. Prix en FCFA.
          </p>
        </div>
        <Modal title={`Ajouter dans « ${cat.label} »`} trigger={{ kind: "button", label: "Ajouter un plat", icon: "plus" }} wide>
          <form action={createItem} className="aform">
            <input type="hidden" name="back" value={back} />
            <ItemFields categories={cats} item={{ categoryId: cat.id }} />
            <div className="modal__foot">
              <ModalCancel />
              <SubmitButton>Ajouter</SubmitButton>
            </div>
          </form>
        </Modal>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <div className="acard acard--flush">
        {items.length === 0 ? (
          <div className="empty">Aucun plat dans cette catégorie.</div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Plat</th>
                  <th style={{ textAlign: "right" }}>Prix</th>
                  <th>Visibilité</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const index = first + i;
                  return (
                    <tr key={it.id} className={it.available ? undefined : "row--muted"}>
                      <td>
                        <strong>{it.name}</strong>
                        <div className="muted">{it.description}</div>
                        {it.tags.length > 0 && <div className="muted">{it.tags.join(" / ")}</div>}
                      </td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        {it.oldPrice && (
                          <div className="muted" style={{ textDecoration: "line-through" }}>
                            {formatPrice(it.oldPrice)}
                          </div>
                        )}
                        <strong>{formatPrice(it.price)}</strong>
                      </td>
                      <td>
                        {it.available ? (
                          <span className="pill pill--confirmee">Visible</span>
                        ) : (
                          <span className="pill pill--off">Masqué</span>
                        )}
                      </td>
                      <td className="td-actions">
                        <ActionMenu>
                          <form action={moveItem}>
                            <input type="hidden" name="id" value={it.id} />
                            <input type="hidden" name="dir" value="up" />
                            <input type="hidden" name="back" value={back} />
                            {index > 0 ? <IconButton icon="up" label="Monter" /> : null}
                          </form>
                          <form action={moveItem}>
                            <input type="hidden" name="id" value={it.id} />
                            <input type="hidden" name="dir" value="down" />
                            <input type="hidden" name="back" value={back} />
                            {index < total - 1 ? <IconButton icon="down" label="Descendre" /> : null}
                          </form>
                          <Modal title={`Modifier « ${it.name} »`} trigger={{ kind: "icon", icon: "edit", label: "Modifier" }} wide>
                            <form action={updateItem} className="aform">
                              <input type="hidden" name="id" value={it.id} />
                              <input type="hidden" name="back" value={back} />
                              <ItemFields item={it} categories={cats} />
                              <div className="modal__foot">
                                <ModalCancel />
                                <SubmitButton>Enregistrer</SubmitButton>
                              </div>
                            </form>
                          </Modal>
                          <form action={toggleItem}>
                            <input type="hidden" name="id" value={it.id} />
                            <input type="hidden" name="available" value={it.available ? "0" : "1"} />
                            <input type="hidden" name="back" value={back} />
                            <IconButton icon={it.available ? "eyeOff" : "eye"} label={it.available ? "Masquer du site" : "Afficher sur le site"} />
                          </form>
                          <ConfirmAction
                            action={deleteItem}
                            fields={{ id: it.id, back }}
                            label="Supprimer"
                            title="Supprimer le plat ?"
                            message={
                              <>
                                <strong>{it.name}</strong> sera définitivement retiré de la carte. Pour le retirer
                                temporairement, utilisez plutôt « Masquer ».
                              </>
                            }
                            confirmLabel="Supprimer"
                          />
                        </ActionMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} total={total} perPage={PER_PAGE} path={path} />
    </>
  );
}
