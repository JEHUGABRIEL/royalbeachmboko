"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { galleryCategories, type GalleryCategory, type Photo } from "@/lib/data";
import { CloseIcon } from "./Icons";

type Props = { photos: Photo[]; filterable?: boolean };

export default function Gallery({ photos, filterable = false }: Props) {
  const [filter, setFilter] = useState<GalleryCategory>("Tous");
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter === "Tous" ? photos : photos.filter((p) => p.category === filter);

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? null : (i + d + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const current = open !== null ? shown[open] : null;

  return (
    <>
      {filterable && (
        <div className="filters">
          {galleryCategories.map((c) => (
            <button key={c} className={`filter${c === filter ? " is-active" : ""}`} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="gallery" key={filter}>
        {shown.map((p, i) => (
          <button
            key={p.src}
            className="gallery__item"
            data-caption={p.alt}
            onClick={() => setOpen(i)}
            style={{ animationDelay: `${i * 30}ms` }}
            aria-label={`Agrandir : ${p.alt}`}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 50vw, 25vw" />
          </button>
        ))}
      </div>
      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.alt} onClick={() => setOpen(null)}>
          <div className="lightbox__frame" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} fill sizes="100vw" />
          </div>
          <p className="lightbox__caption">
            {current.alt} — {open! + 1}/{shown.length}
          </p>
          <button className="lightbox__btn lightbox__close" onClick={() => setOpen(null)} aria-label="Fermer">
            <CloseIcon className="" />
          </button>
          <button
            className="lightbox__btn lightbox__prev"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Précédente"
          >
            ‹
          </button>
          <button
            className="lightbox__btn lightbox__next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Suivante"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
