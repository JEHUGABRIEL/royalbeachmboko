"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  confirm?: string;
  name?: string;
  value?: string;
  small?: boolean;
};

export default function SubmitButton({ children, variant = "primary", confirm, name, value, small }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`abtn abtn--${variant}${small ? " abtn--sm" : ""}`}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
