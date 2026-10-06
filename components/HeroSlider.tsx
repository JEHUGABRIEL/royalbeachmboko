"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = ["/images/vue-oubangui.jpg", "/images/terrasse-parasols-2.jpg", "/images/plage-palmier.jpg"];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <section className="hero">
      {slides.map((src, i) => (
        <div key={src} className={`hero__slide${i === index ? " is-active" : ""}`} aria-hidden={i !== index}>
          <Image src={src} alt="" fill priority={i === 0} sizes="100vw" />
        </div>
      ))}
      <div className="hero__content">
        <div className="emblem">
          <span className="emblem__stars">★ ★ ★ ★ ★</span>
          <div className="emblem__top">
            <span>Restaurant</span>
            <span className="emblem__amp">&amp;</span>
            <span>Bar</span>
          </div>
          <h1 className="emblem__title">
            Royal Beach
          </h1>
          <svg className="emblem__arc" viewBox="0 0 320 60" aria-label="Mbocko">
            <path id="arc" d="M20 10 Q160 70 300 10" fill="none" />
            <text fill="#fff" fontSize="17" letterSpacing="8" fontFamily="var(--font-montserrat)" fontWeight="600">
              <textPath href="#arc" startOffset="50%" textAnchor="middle">
                MBOCKO · RCA
              </textPath>
            </text>
          </svg>
        </div>
        <p className="hero__lead">Les pieds dans le sable, face à l&apos;Oubangui</p>
        <Link href="/reservation" className="btn btn--light">
          Réserver une table
        </Link>
      </div>
      <div className="hero__dots">
        {slides.map((s, i) => (
          <button
            key={s}
            className={`dot${i === index ? " is-active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
