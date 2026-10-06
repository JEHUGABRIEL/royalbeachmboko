"use client";

import { useState } from "react";
import Icon from "./icons";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/** Champ mot de passe avec bouton « œil » pour afficher / masquer la saisie. */
export default function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pwd">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="pwd__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}
