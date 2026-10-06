"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, menu } from "@/lib/data";

type Props = { limit?: number; showFooter?: boolean };

export default function MenuTabs({ limit, showFooter = false }: Props) {
  const [active, setActive] = useState(menu[0].id);
  const category = menu.find((c) => c.id === active) ?? menu[0];
  const items = limit ? category.items.slice(0, limit) : category.items;

  return (
    <>
      <div className="tabs" role="tablist">
        {menu.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === active}
            className={`tab${c.id === active ? " is-active" : ""}`}
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="container">
        <div className="menu-card" role="tabpanel">
          <div className="menu-grid" key={category.id}>
            {items.map((item, i) => (
              <article className="menu-item" key={item.name} style={{ animationDelay: `${i * 40}ms` }}>
                <span className="menu-item__icon" aria-hidden="true">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <h3 className="menu-item__name">{item.name}</h3>
                  <p className="menu-item__desc">{item.description}</p>
                  <span className="menu-item__tags">{item.tags.join(" / ")}</span>
                </div>
                <div className="menu-item__price">
                  {item.oldPrice && <span className="menu-item__old">{formatPrice(item.oldPrice)}</span>}
                  {formatPrice(item.price)}
                </div>
              </article>
            ))}
          </div>
          {showFooter && (
            <div className="menu-card__footer">
              <Link href="/menu" className="btn btn--dark">
                Voir toute la carte
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
