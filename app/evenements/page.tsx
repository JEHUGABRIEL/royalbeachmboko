import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventRow } from "@/components/Events";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import { events } from "@/lib/data";

export const metadata: Metadata = { title: "Événements" };

export default function EvenementsPage() {
  return (
    <>
      <PageHero script="À venir" title="Nos événements" image="/images/bar-violet.jpg" crumb="Événements" />
      <section className="section section--dark">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="events__stack">
            {events.map((e) => (
              <EventRow key={e.slug} e={e} withDescription />
            ))}
          </div>
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <SectionTitle script="Privatisez" title="Votre événement" />
          <div className="mosaic">
            <div className="mosaic__cell mosaic__cell--big">
              <Image src="/images/salle-evenement.jpg" alt="Salle de réception décorée" fill sizes="(max-width: 700px) 50vw, 33vw" />
            </div>
            <div className="mosaic__cell">
              <Image src="/images/table-evenement.jpg" alt="Table dressée" fill sizes="(max-width: 700px) 50vw, 33vw" />
            </div>
            <div className="mosaic__cell">
              <Image src="/images/salle-banquet.jpg" alt="Salle de banquet" fill sizes="(max-width: 700px) 50vw, 33vw" />
            </div>
            <div className="mosaic__cell">
              <Image src="/images/pergola-riviere.jpg" alt="Pergola au bord du fleuve" fill sizes="(max-width: 700px) 50vw, 33vw" />
            </div>
            <div className="mosaic__cell">
              <Image src="/images/salle-reception.jpg" alt="Grande salle" fill sizes="(max-width: 700px) 50vw, 33vw" />
            </div>
          </div>
          <p className="prose mt-40">
            Mariages, dots, anniversaires, baptêmes, séminaires d&apos;entreprise : nos salles et terrasses accueillent vos
            invités avec décoration, sonorisation et menu sur mesure.
          </p>
          <div className="center mt-40">
            <Link href="/contact" className="btn btn--dark">
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
