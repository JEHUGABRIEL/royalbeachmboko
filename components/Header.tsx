"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/data";
import Logo from "./Logo";
import Socials, { type SocialLinks } from "./Socials";
import { CloseIcon, MenuIcon } from "./Icons";

export default function Header({ socials }: { socials: SocialLinks }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`header${solid || open ? " header--solid" : ""}`}>
      <div className="container header__inner">
        <Logo />
        <nav className={`nav${open ? " nav--open" : ""}`} aria-label="Navigation principale">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "is-active" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Socials {...socials} />
        <button
          className="burger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : `Ouvrir le menu ${site.name}`}
          aria-expanded={open}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
