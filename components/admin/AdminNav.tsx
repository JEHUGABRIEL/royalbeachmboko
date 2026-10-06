"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/reservations", label: "Réservations", badge: "reservations" },
  { href: "/admin/messages", label: "Messages", badge: "messages" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/parametres", label: "Infos & horaires" },
  { href: "/admin/admins", label: "Administrateurs" },
] as const;

export default function AdminNav({ badges }: { badges: { reservations: number; messages: number } }) {
  const pathname = usePathname();
  return (
    <nav className="admin-nav">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        const n = "badge" in l ? badges[l.badge] : 0;
        return (
          <Link key={l.href} href={l.href} className={active ? "is-active" : undefined}>
            {l.label}
            {n > 0 && <span className="badge">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
