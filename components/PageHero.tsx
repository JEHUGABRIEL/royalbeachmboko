import Image from "next/image";
import Link from "next/link";
import SectionTitle from "./SectionTitle";

type Props = { script: string; title: string; image: string; crumb: string };

export default function PageHero({ script, title, image, crumb }: Props) {
  return (
    <section className="page-hero">
      <Image src={image} alt="" fill priority sizes="100vw" />
      <div className="page-hero__content container">
        <SectionTitle script={script} title={title} as="h1" />
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span>/</span>
          {crumb}
        </nav>
      </div>
    </section>
  );
}
