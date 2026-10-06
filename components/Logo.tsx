import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Royal Beach Mbocko — accueil">
      <span className="logo__script">Royal Beach</span>
      <span className="logo__sub">Mbocko</span>
    </Link>
  );
}
