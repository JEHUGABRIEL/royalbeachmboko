import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { formatPrice } from "@/lib/data";
import { db, schema } from "@/lib/db";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  moveCategory,
  moveItem,
  renameCategory,
  toggleItem,
} from "./actions";
import ItemFields from "./ItemFields";

export const metadata: Metadata = { title: "Menu" };

function Hidden({ id, dir }: { id: number; dir?: string }) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      {dir && <input type="hidden" name="dir" value={dir} />}
    </>
  );
}

export default async function MenuAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [cats, items] = await Promise.all([
    db.select().from(schema.menuCategories).orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id)),
    db.select().from(schema.menuItems).orderBy(asc(schema.menuItems.position), asc(schema.menuItems.id)),
  ]);
  const catOptions = cats.map(({ id, label }) => ({ id, label }));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Menu</h1>
          <p>Les catégories apparaissent comme onglets sur le site, dans cet ordre. Prix en FCFA.</p>
        </div>
        <details className="inline-edit">
          <summary className="abtn abtn--primary">+ Nouvelle catégorie</summary>
          <form action={createCategory} style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input className="inline-input" name="label" placeholder="Ex. Desserts" required />
            <SubmitButton small>Créer</SubmitButton>
          </form>
        </details>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      {cats.length === 0 && <div className="acard empty">Créez une première catégorie (ex. Plats, Boissons).</div>}

      {cats.map((cat, ci) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        return (
          <section className="acard acard--flush" key={cat.id}>
            <div className="cat-head">
              <h2>
                {cat.label} <span className="muted">({catItems.length})</span>
              </h2>
              <div className="row-actions">
                <details className="inline-edit">
                  <summary className="abtn abtn--ghost abtn--sm">Renommer</summary>
                  <form action={renameCategory} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <Hidden id={cat.id} />
                    <input className="inline-input" name="label" defaultValue={cat.label} required />
                    <SubmitButton small>OK</SubmitButton>
                  </form>
                </details>
                {ci > 0 && (
                  <form action={moveCategory}>
                    <Hidden id={cat.id} dir="up" />
                    <SubmitButton small variant="ghost">
                      ↑
                    </SubmitButton>
                  </form>
                )}
                {ci < cats.length - 1 && (
                  <form action={moveCategory}>
                    <Hidden id={cat.id} dir="down" />
                    <SubmitButton small variant="ghost">
                      ↓
                    </SubmitButton>
                  </form>
                )}
                <form action={deleteCategory}>
                  <Hidden id={cat.id} />
                  <SubmitButton
                    small
                    variant="danger"
                    confirm={`Supprimer la catégorie « ${cat.label} » et ses ${catItems.length} plat(s) ?`}
                  >
                    Supprimer
                  </SubmitButton>
                </form>
              </div>
            </div>

            {catItems.length > 0 && (
              <div className="table-wrap">
                <table className="atable">
                  <tbody>
                    {catItems.map((it, i) => (
                      <tr key={it.id} style={it.available ? undefined : { opacity: 0.55 }}>
                        <td>
                          <strong>{it.name}</strong> {!it.available && <span className="pill pill--off">Masqué</span>}
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
                          <div className="row-actions">
                            {i > 0 && (
                              <form action={moveItem}>
                                <Hidden id={it.id} dir="up" />
                                <SubmitButton small variant="ghost">
                                  ↑
                                </SubmitButton>
                              </form>
                            )}
                            {i < catItems.length - 1 && (
                              <form action={moveItem}>
                                <Hidden id={it.id} dir="down" />
                                <SubmitButton small variant="ghost">
                                  ↓
                                </SubmitButton>
                              </form>
                            )}
                            <Link href={`/admin/menu/${it.id}`} className="abtn abtn--ghost abtn--sm">
                              Modifier
                            </Link>
                            <form action={toggleItem}>
                              <Hidden id={it.id} />
                              <input type="hidden" name="available" value={it.available ? "0" : "1"} />
                              <SubmitButton small variant="ghost">
                                {it.available ? "Masquer" : "Afficher"}
                              </SubmitButton>
                            </form>
                            <form action={deleteItem}>
                              <Hidden id={it.id} />
                              <SubmitButton small variant="danger" confirm={`Supprimer « ${it.name} » ?`}>
                                Supprimer
                              </SubmitButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <details className="inline-edit" style={{ padding: "14px 20px" }}>
              <summary>+ Ajouter un plat dans « {cat.label} »</summary>
              <form action={createItem} className="aform" style={{ marginTop: 14 }}>
                <ItemFields categories={catOptions} item={{ categoryId: cat.id }} />
                <div className="form-foot">
                  <SubmitButton>Ajouter</SubmitButton>
                </div>
              </form>
            </details>
          </section>
        );
      })}
    </>
  );
}
