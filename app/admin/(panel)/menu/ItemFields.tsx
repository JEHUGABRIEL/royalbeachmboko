type Item = {
  name?: string;
  description?: string;
  price?: number;
  oldPrice?: number | null;
  tags?: string[];
  available?: boolean;
  categoryId?: number;
};

export default function ItemFields({ item = {}, categories }: { item?: Item; categories: { id: number; label: string }[] }) {
  return (
    <>
      <div className="afield">
        <label>Nom du plat *</label>
        <input name="name" required defaultValue={item.name} maxLength={120} />
      </div>
      <div className="afield">
        <label>Catégorie</label>
        <select name="categoryId" defaultValue={item.categoryId}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="afield afield--full">
        <label>Description</label>
        <input name="description" defaultValue={item.description} maxLength={300} />
      </div>
      <div className="afield">
        <label>Prix (FCFA) *</label>
        <input name="price" inputMode="numeric" required defaultValue={item.price} placeholder="5000" />
      </div>
      <div className="afield">
        <label>Ancien prix (FCFA)</label>
        <input name="oldPrice" inputMode="numeric" defaultValue={item.oldPrice ?? ""} placeholder="Laisser vide si pas de promo" />
        <small>Affiché barré à côté du prix si supérieur.</small>
      </div>
      <div className="afield">
        <label>Étiquettes</label>
        <input name="tags" defaultValue={item.tags?.join(", ")} placeholder="Spécialité, Grillade" />
        <small>Séparées par des virgules.</small>
      </div>
      <div className="afield" style={{ justifyContent: "flex-end" }}>
        <label className="check">
          <input type="checkbox" name="available" defaultChecked={item.available ?? true} /> Visible sur le site
        </label>
      </div>
    </>
  );
}
