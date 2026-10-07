type Props = {
  /** "splash" : plein écran au premier chargement ; "page" : changement de page du site ; "admin" : back-office. */
  variant?: "splash" | "page" | "admin";
  label?: string;
};

/** Logo animé de Royal Beach (vagues de l'Oubangui sous le nom). */
export default function Loader({ variant = "page", label = "Chargement" }: Props) {
  return (
    <div className={`loader loader--${variant}`} role="status" aria-live="polite">
      <div className="loader__mark">
        <span className="loader__script">Royal Beach</span>
        <span className="loader__sub">Mbocko</span>
        <svg className="loader__waves" viewBox="0 0 120 24" aria-hidden="true">
          <path className="loader__wave loader__wave--1" d="M0 8 Q 15 2 30 8 T 60 8 T 90 8 T 120 8" />
          <path className="loader__wave loader__wave--2" d="M0 16 Q 15 10 30 16 T 60 16 T 90 16 T 120 16" />
        </svg>
        <span className="loader__bar">
          <span />
        </span>
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
