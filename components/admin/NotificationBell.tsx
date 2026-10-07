"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "./icons";

type Item = {
  id: number;
  summary: string;
  actorName: string;
  category: string;
  link: string | null;
  createdAt: string;
  read: boolean;
};

const POLL_MS = 30_000;

const categoryIcon: Record<string, IconName> = {
  connexion: "user",
  reservation: "clock",
  message: "mail",
  menu: "note",
  evenement: "activity",
  galerie: "camera",
  parametres: "edit",
  admin: "user",
  securite: "key",
};

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Cloche de notifications : actualisée toutes les 30 s et à chaque changement de page. */
export default function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Item[] | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { unread: number; items: Item[] };
      setUnread(data.unread);
      setItems(data.items);
    } catch {
      // Réseau indisponible : on réessaiera au prochain intervalle.
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh, pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const post = async (body: object) => {
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) setUnread(((await res.json()) as { unread: number }).unread);
  };

  const openItem = async (item: Item) => {
    if (!item.read) {
      setItems((list) => list?.map((i) => (i.id === item.id ? { ...i, read: true } : i)) ?? null);
      await post({ id: item.id });
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  };

  const markAll = async () => {
    setItems((list) => list?.map((i) => ({ ...i, read: true })) ?? null);
    await post({ all: true });
  };

  return (
    <div className="bell" ref={root}>
      <button
        type="button"
        className={`bell__btn${open ? " is-open" : ""}`}
        aria-label={unread ? `Notifications (${unread} non lues)` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refresh();
        }}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="bell__count">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="bell__panel" role="dialog" aria-label="Notifications">
          <div className="bell__head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="linkbtn" onClick={markAll}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="bell__list">
            {items === null && <p className="bell__empty">Chargement…</p>}
            {items?.length === 0 && <p className="bell__empty">Aucune notification pour le moment.</p>}
            {items?.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`bell__item${n.read ? "" : " is-unread"}`}
                onClick={() => openItem(n)}
              >
                <span className={`bell__icon bell__icon--${n.category}`}>
                  <Icon name={categoryIcon[n.category] ?? "activity"} size={15} />
                </span>
                <span className="bell__text">
                  <span>{n.summary}</span>
                  <small>{ago(n.createdAt)}</small>
                </span>
              </button>
            ))}
          </div>
          <a
            href="/admin/activite"
            className="bell__foot"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push("/admin/activite");
            }}
          >
            Voir toute l&apos;activité
          </a>
        </div>
      )}
    </div>
  );
}
