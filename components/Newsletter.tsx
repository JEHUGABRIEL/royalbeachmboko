"use client";

import { useState } from "react";
import { SendIcon } from "./Icons";

export default function Newsletter() {
  const [done, setDone] = useState(false);
  if (done) return <p style={{ color: "var(--gold)" }}>Merci ! Vous recevrez nos prochaines nouvelles.</p>;
  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input type="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" />
      <button type="submit" aria-label="S'inscrire">
        <SendIcon />
      </button>
    </form>
  );
}
