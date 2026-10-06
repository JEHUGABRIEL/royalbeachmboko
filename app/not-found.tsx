import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <>
      <PageHero script="Oups" title="Page introuvable" image="/images/passerelle-bois.jpg" crumb="404" />
      <section className="section section--dark center">
        <Link href="/" className="btn btn--light">
          Retour à l&apos;accueil
        </Link>
      </section>
    </>
  );
}
