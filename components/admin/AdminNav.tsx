"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./icons";

type Badges = { reservations: number; messages: number; admins: number };
type Category = { slug: string; label: string };

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/reservations", label: "Réservations", badge: "reservations" as const },
  { href: "/admin/messages", label: "Messages", badge: "messages" as const },
  { href: "/admin/menu", label: "Menu", submenu: true },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/activite", label: "Activité" },
  { href: "/admin/parametres", label: "Infos & horaires" },
  { href: "/admin/admins", label: "Administrateurs", badge: "admins" as const },
];

export default function AdminNav({ badges, categories }: { badges: Badges; categories: Category[] }) {
  const pathname = usePathname();
  const inMenu = pathname.startsWith("/admin/menu");
  const [menuOpen, setMenuOpen] = useState(inMenu);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav className="admin-nav">
      {links.map((l) => {
        const n = l.badge ? badges[l.badge] : 0;
        if (!l.submenu) {
          return (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "is-active" : undefined}>
              {l.label}
              {n > 0 && <span className="badge">{n}</span>}
            </Link>
          );
        }
        const open = menuOpen || inMenu;
        return (
          <div key={l.href} className={`admin-nav__group${open ? " is-open" : ""}`}>
            <button
              type="button"
              className={inMenu ? "is-active" : undefined}
              aria-expanded={open}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {l.label}
              <span className="admin-nav__chevron">
                <Icon name="chevron" size={14} />
              </span>
            </button>
            {open && (
              <div className="admin-nav__sub">
                <Link href="/admin/menu" className={pathname === "/admin/menu" ? "is-active" : undefined}>
                  Catégories
                </Link>
                {categories.map((c) => {
                  const href = `/admin/menu/${c.slug}`;
                  return (
                    <Link key={c.slug} href={href} className={pathname === href ? "is-active" : undefined}>
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
