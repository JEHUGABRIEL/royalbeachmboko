"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "ok" | "error"; message?: string }>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ kind: "sending" });
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    const body = await res?.json().catch(() => null);
    if (!res?.ok) return setState({ kind: "error", message: body?.error ?? "Une erreur est survenue." });
    setState({ kind: "ok", message: body.message });
    form.reset();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor="c-name">Nom</label>
          <input id="c-name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="c-contact">Téléphone ou e-mail</label>
          <input id="c-contact" name="contact" required />
        </div>
        <div className="field field--full">
          <label htmlFor="c-subject">Sujet</label>
          <select id="c-subject" name="subject" defaultValue="Information">
            <option>Information</option>
            <option>Privatisation / mariage</option>
            <option>Événement d&apos;entreprise</option>
            <option>Autre</option>
          </select>
        </div>
        <div className="field field--full">
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="message" required rows={5} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn--dark" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Envoi…" : "Envoyer"}
        </button>
      </div>
      {state.message && (
        <p className={`form-message form-message--${state.kind === "ok" ? "ok" : "error"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
