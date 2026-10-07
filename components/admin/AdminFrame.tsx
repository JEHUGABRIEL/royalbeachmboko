"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./icons";

type Props = {
  sidebar: React.ReactNode;
  brand: React.ReactNode;
  topRight: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Structure du back-office : barre latérale fixe sur grand écran, tiroir ouvert
 * par un bouton hamburger sur tablette et mobile.
 */
export default function AdminFrame({ sidebar, brand, topRight, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`admin${open ? " is-nav-open" : ""}`}>
      <aside className="admin-side" id="admin-sidebar">
        <button type="button" className="admin-side__close" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
          <Icon name="x" />
        </button>
        {sidebar}
      </aside>
      <div className="admin-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-burger"
            aria-label="Ouvrir le menu"
            aria-controls="admin-sidebar"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
          <div className="admin-topbar__brand">{brand}</div>
          <div className="admin-topbar__right">{topRight}</div>
        </header>
        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
}
