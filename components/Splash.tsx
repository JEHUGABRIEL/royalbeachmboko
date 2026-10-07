"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";

const MIN_VISIBLE_MS = 700;

/**
 * Écran de chargement affiché à l'arrivée sur le site, retiré dès que la page
 * est chargée. Sans JavaScript, une animation CSS le fait disparaître seule.
 */
export default function Splash() {
  const [state, setState] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    const start = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    const hide = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      timer = setTimeout(() => setState("leaving"), wait);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", hide);
    };
  }, []);

  if (state === "gone") return null;
  return (
    <div
      className={`splash${state === "leaving" ? " splash--leaving" : ""}`}
      onTransitionEnd={() => state === "leaving" && setState("gone")}
    >
      <Loader variant="splash" label="Chargement du site" />
    </div>
  );
}
