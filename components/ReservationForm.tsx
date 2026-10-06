"use client";

import { FormEvent, useState } from "react";

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

const today = () => new Date().toISOString().slice(0, 10);

type Props = { detailed?: boolean; defaultOccasion?: string };

export default function ReservationForm({ detailed = false, defaultOccasion }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Une erreur est survenue.");
      setStatus({ kind: "ok", message: body.message });
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Une erreur est survenue." });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="guests">Personnes</label>
          <select id="guests" name="guests" defaultValue="2" required>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n > 1 ? "personnes" : "personne"}
              </option>
            ))}
            <option value="13+">Groupe (13 et +)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" min={today()} required />
        </div>
        <div className="field">
          <label htmlFor="time">Heure</label>
          <input id="time" name="time" type="time" min="09:00" max="23:00" defaultValue="12:30" required />
        </div>
        <div className="field">
          <label htmlFor="name">Nom</label>
          <input id="name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+236" required />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
        {detailed && (
          <>
            <div className="field">
              <label htmlFor="area">Espace souhaité</label>
              <select id="area" name="area" defaultValue="Indifférent">
                <option>Indifférent</option>
                <option>Terrasse face au fleuve</option>
                <option>Salle panoramique</option>
                <option>Plage / ponton</option>
                <option>Salle de réception (groupe)</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: "span 2" }}>
              <label htmlFor="occasion">Occasion</label>
              <input id="occasion" name="occasion" type="text" placeholder="Anniversaire, mariage, réunion…" defaultValue={defaultOccasion} />
            </div>
            <div className="field field--full">
              <label htmlFor="notes">Message</label>
              <textarea id="notes" name="notes" placeholder="Allergies, chaise bébé, demande particulière…" />
            </div>
          </>
        )}
      </div>
      <div className="form-actions">
        <button className="btn btn--dark" type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Envoi…" : "Réserver"}
        </button>
      </div>
      {status.message && (
        <p className={`form-message form-message--${status.kind === "ok" ? "ok" : "error"}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
