"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "./icons";

type MenuApi = { close: () => void; hold: () => void; release: () => void };
const MenuContext = createContext<MenuApi | null>(null);

/** Vrai quand le composant est rendu dans un menu d'actions (affichage en ligne « icône + libellé »). */
export const useActionMenu = () => useContext(MenuContext);

/**
 * Menu « ⋮ » regroupant les actions d'une ligne de tableau. Le panneau reste monté
 * (simplement masqué) pour que les formulaires et les modales qu'il contient
 * continuent de fonctionner après sa fermeture.
 */
export default function ActionMenu({ children, label = "Actions" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const held = useRef(false);

  const close = useCallback(() => {
    if (!held.current) setOpen(false);
  }, []);
  const api = useRef<MenuApi>({
    close: () => setTimeout(close, 0),
    hold: () => {
      held.current = true;
    },
    release: () => {
      held.current = false;
      setOpen(false);
    },
  });

  // Positionne le panneau sous le bouton (ou au-dessus s'il manque de place).
  useLayoutEffect(() => {
    if (!open || !button.current || !panel.current) return;
    const b = button.current.getBoundingClientRect();
    const p = panel.current.getBoundingClientRect();
    const below = b.bottom + 6 + p.height <= window.innerHeight - 8;
    setPos({
      top: below ? b.bottom + 6 : Math.max(8, b.top - 6 - p.height),
      left: Math.max(8, Math.min(b.right - p.width, window.innerWidth - p.width - 8)),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (button.current?.contains(t) || panel.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !held.current) {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onScroll = () => close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, close]);

  return (
    <MenuContext.Provider value={api.current}>
      <div className="amenu">
        <button
          ref={button}
          type="button"
          className={`ibtn amenu__trigger${open ? " is-open" : ""}`}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            setPos(null);
            setOpen((v) => !v);
          }}
        >
          <Icon name="more" size={18} />
        </button>
        <div
          ref={panel}
          className="amenu__panel"
          role="menu"
          hidden={!open}
          style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }}
        >
          {children}
        </div>
      </div>
    </MenuContext.Provider>
  );
}
