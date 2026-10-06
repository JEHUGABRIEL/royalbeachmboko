"use client";

import Modal, { ModalCancel } from "./Modal";
import SubmitButton from "./SubmitButton";
import Icon, { type IconName } from "./icons";

type Props = {
  action: (fd: FormData) => Promise<void>;
  fields?: Record<string, string | number>;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  icon?: IconName;
  label: string;
  /** "icon" : bouton-icône (colonnes d'actions) ; "button" : bouton texte. */
  as?: "icon" | "button" | "link";
};

/** Action sensible (suppression, déconnexion…) précédée d'une modale de confirmation. */
export default function ConfirmAction({
  action,
  fields = {},
  title,
  message,
  confirmLabel,
  icon = "trash",
  label,
  as = "icon",
}: Props) {
  const trigger =
    as === "icon"
      ? ({ kind: "icon", label, icon, tone: "danger" } as const)
      : as === "link"
        ? ({ kind: "link", label } as const)
        : ({ kind: "button", label, icon, variant: "ghost" } as const);
  return (
    <Modal title={title} trigger={trigger}>
      <div className="confirm">
        <span className="confirm__icon">
          <Icon name={icon === "logout" ? "logout" : "alert"} size={22} />
        </span>
        <p>{message}</p>
      </div>
      <form action={action} className="modal__foot">
        {Object.entries(fields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <ModalCancel />
        <SubmitButton variant="danger-solid">{confirmLabel}</SubmitButton>
      </form>
    </Modal>
  );
}
