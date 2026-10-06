"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setI((v) => (v + 1) % testimonials.length), 7000);
    return () => clearTimeout(id);
  }, [i]);

  const t = testimonials[i];
  return (
    <div className="testimonial">
      <div className="testimonial__avatar">
        <Image src="/images/biere-oubangui.jpg" alt="" fill sizes="80px" />
      </div>
      <blockquote className="testimonial__quote" key={i}>
        {t.quote}
      </blockquote>
      <div className="testimonial__author">{t.author}</div>
      <div className="testimonial__role">{t.role}</div>
      <div className="dots">
        {testimonials.map((x, k) => (
          <button
            key={x.author}
            className={`dot${k === i ? " is-active" : ""}`}
            onClick={() => setI(k)}
            aria-label={`Avis ${k + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
