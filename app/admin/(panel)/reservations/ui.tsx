import type { ReservationStatus } from "@/lib/db/schema";

export const statusLabels: Record<ReservationStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

export function StatusPill({ status }: { status: ReservationStatus }) {
  return <span className={`pill pill--${status}`}>{statusLabels[status]}</span>;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
