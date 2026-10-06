import Link from "next/link";
import Icon from "./icons";

type Props = {
  page: number;
  total: number;
  perPage: number;
  /** Chemin et paramètres courants (hors `page`, `ok`, `error`). */
  path: string;
  params?: Record<string, string | undefined>;
};

export default function Pagination({ page, total, perPage, path, params = {} }: Props) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page" && k !== "ok" && k !== "error") q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${path}?${s}` : path;
  };

  // Pages affichées : première, dernière, et deux voisines de la page courante.
  const shown = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);

  return (
    <nav className="pager" aria-label="Pagination">
      <span className="muted">
        {from}–{to} sur {total}
      </span>
      <div className="pager__links">
        {page > 1 ? (
          <Link href={href(page - 1)} className="pager__btn" aria-label="Page précédente">
            <Icon name="left" size={14} />
          </Link>
        ) : (
          <span className="pager__btn is-disabled">
            <Icon name="left" size={14} />
          </span>
        )}
        {shown.map((p, i) => (
          <span key={p} style={{ display: "contents" }}>
            {i > 0 && p - shown[i - 1] > 1 && <span className="pager__gap">…</span>}
            <Link href={href(p)} className={`pager__btn${p === page ? " is-active" : ""}`} aria-current={p === page ? "page" : undefined}>
              {p}
            </Link>
          </span>
        ))}
        {page < pages ? (
          <Link href={href(page + 1)} className="pager__btn" aria-label="Page suivante">
            <Icon name="right" size={14} />
          </Link>
        ) : (
          <span className="pager__btn is-disabled">
            <Icon name="right" size={14} />
          </span>
        )}
      </div>
    </nav>
  );
}
