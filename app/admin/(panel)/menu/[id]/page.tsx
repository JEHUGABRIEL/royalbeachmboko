import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import { db, schema } from "@/lib/db";
import { updateItem } from "../actions";
import ItemFields from "../ItemFields";

export const metadata: Metadata = { title: "Modifier un plat" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function EditItemPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const { error } = await searchParams;
  if (!Number.isInteger(id)) notFound();
  const [[item], cats] = await Promise.all([
    db.select().from(schema.menuItems).where(eq(schema.menuItems.id, id)),
    db
      .select({ id: schema.menuCategories.id, label: schema.menuCategories.label })
      .from(schema.menuCategories)
      .orderBy(asc(schema.menuCategories.position)),
  ]);
  if (!item) notFound();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{item.name}</h1>
          <p>
            <Link href="/admin/menu">← Retour au menu</Link>
          </p>
        </div>
      </div>
      <Flash error={error} />
      <div className="acard">
        <form action={updateItem} className="aform">
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} categories={cats} />
          <div className="form-foot">
            <Link href="/admin/menu" className="abtn abtn--ghost">
              Annuler
            </Link>
            <SubmitButton>Enregistrer</SubmitButton>
          </div>
        </form>
      </div>
    </>
  );
}
