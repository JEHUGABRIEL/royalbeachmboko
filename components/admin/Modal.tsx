"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "./icons";

type Trigger =
  | { kind: "button"; label: string; icon?: IconName; variant?: "primary" | "ghost"; small?: boolean }
  | { kind: "icon"; label: string; icon: IconName; tone?: "default" | "primary" | "danger" | "success" }
  | { kind: "link"; label: string };

type Props = {
  title: string;
  trigger: Trigger;
  children: React.ReactNode;
  wide?: boolean;
};

/**
 * Fenêtre modale basée sur <dialog>. Elle se referme d'elle-même quand l'action
 * serveur redirige (changement des paramètres d'URL ok/error).
 */
export default function Modal({ title, trigger, children, wide }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  const signature = params.toString();

  useEffect(() => {
    setOpen(false);
  }, [signature]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      {trigger.kind === "button" && (
        <button
          type="button"
          className={`abtn abtn--${trigger.variant ?? "primary"}${trigger.small ? " abtn--sm" : ""}`}
          onClick={() => setOpen(true)}
        >
          {trigger.icon && <Icon name={trigger.icon} size={16} />}
          {trigger.label}
        </button>
      )}
      {trigger.kind === "icon" && (
        <button
          type="button"
          className={`ibtn ibtn--${trigger.tone ?? "default"}`}
          aria-label={trigger.label}
          data-tip={trigger.label}
          onClick={() => setOpen(true)}
        >
          <Icon name={trigger.icon} size={16} />
        </button>
      )}
      {trigger.kind === "link" && (
        <button type="button" className="linkbtn" onClick={() => setOpen(true)}>
          {trigger.label}
        </button>
      )}
      <dialog
        ref={ref}
        className={`modal${wide ? " modal--wide" : ""}`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
      >
        {open && (
          <div className="modal__inner">
            <div className="modal__head">
              <h2>{title}</h2>
              <button type="button" className="modal__close" aria-label="Fermer" onClick={() => setOpen(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal__body">{children}</div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** Bouton « Annuler » qui ferme la modale parente. */
export function ModalCancel({ label = "Annuler" }: { label?: string }) {
  return (
    <button
      type="button"
      className="abtn abtn--ghost"
      onClick={(e) => (e.currentTarget.closest("dialog") as HTMLDialogElement | null)?.close()}
    >
      {label}
    </button>
  );
}
