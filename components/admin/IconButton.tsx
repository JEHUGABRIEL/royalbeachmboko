"use client";

import { useFormStatus } from "react-dom";
import Icon, { type IconName } from "./icons";

type Props = {
  icon: IconName;
  label: string;
  tone?: "default" | "primary" | "danger" | "success";
  type?: "submit" | "button";
  onClick?: () => void;
};

/** Bouton d'action carré avec icône ; le libellé sert d'infobulle et de nom accessible. */
export default function IconButton({ icon, label, tone = "default", type = "submit", onClick }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type={type}
      className={`ibtn ibtn--${tone}`}
      aria-label={label}
      data-tip={label}
      disabled={type === "submit" && pending}
      onClick={onClick}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
