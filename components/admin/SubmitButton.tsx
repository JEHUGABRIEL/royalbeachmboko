"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger" | "danger-solid";
  small?: boolean;
};

export default function SubmitButton({ children, variant = "primary", small }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`abtn abtn--${variant}${small ? " abtn--sm" : ""}`}>
      {pending ? "Patientez…" : children}
    </button>
  );
}
