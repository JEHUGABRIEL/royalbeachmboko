"use client";

import { useFormStatus } from "react-dom";
import { useActionMenu } from "./ActionMenu";
import Icon, { type IconName } from "./icons";

type Props = {
  icon: IconName;
  label: string;
  tone?: "default" | "primary" | "danger" | "success";
  type?: "submit" | "button";
  onClick?: () => void;
};

/** Bouton d'action : icône seule (avec infobulle), ou ligne « icône + libellé » dans un menu ⋮. */
export default function IconButton({ icon, label, tone = "default", type = "submit", onClick }: Props) {
  const { pending } = useFormStatus();
  const menu = useActionMenu();
  if (menu) {
    return (
      <button
        type={type}
        role="menuitem"
        className={`amenu__item amenu__item--${tone}`}
        disabled={type === "submit" && pending}
        onClick={() => {
          onClick?.();
          menu.close();
        }}
      >
        <Icon name={icon} size={16} />
        {label}
      </button>
    );
  }
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
