import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import { GlassIcon, KidsIcon, SunIcon, WaveIcon } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import { photos } from "@/lib/data";

export const metadata: Metadata = { title: "Le lieu" };

const features = [
  { Icon: WaveIcon, title: "Face à l'Oubangui", text: "Pontons, plage et passerelles en bois au bord du fleuve." },
  { Icon: SunIcon, title: "Terrasses ombragées", text: "Parasols, pergolas et jardin tropical pour profiter du soleil." },
  { Icon: GlassIcon, title: "Bar & soirées", text: "Cocktails, bières fraîches, billard et soirées DJ le week-end." },
  { Icon: KidsIcon, title: "Pour les enfants", text: "Aire de jeux sur le sable, toboggans et trampoline." },
];

export default function AProposPage() {
  return (
    <>
      <PageHero script="Bienvenue" title="Le lieu" image="/images/jardin-riviere.jpg" crumb="Le lieu" />

      <section className="split">
        <div className="split__image">
          <Image src="/images/salle-panoramique.jpg" alt="Salle panoramique" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="split__text">
          <div className="framed">
            <SectionTitle script="Notre histoire" title="Royal Beach" />
            <p>
              Niché à Mbocko, sur la rive de l&apos;Oubangui, Royal Beach est né d&apos;une envie simple : offrir aux
              familles et aux amis de Bangui un coin de plage où bien manger, se détendre et faire la fête.
            </p>
            <p>
              Notre salle panoramique, nos terrasses et nos pontons accueillent aussi bien un déjeuner en tête-à-tête
              qu&apos;une réception de plusieurs centaines d&apos;invités.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <SectionTitle script="Ce qui nous rend uniques" title="Nos espaces" />
          <div className="features" style={{ marginTop: 0 }}>
            {features.map(({ Icon, title, text }) => (
              <div className="feature" key={title}>
                <Icon className="feature__icon" />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <SectionTitle script="En images" title="Loisirs & détente" />
        <div className="container" style={{ maxWidth: 1400 }}>
          <Gallery photos={photos.filter((p) => p.category === "Loisirs" || p.category === "Fleuve").slice(0, 8)} />
        </div>
        <div className="center mt-40">
          <Link href="/reservation" className="btn btn--light">
            Réserver une table
          </Link>
        </div>
      </section>
    </>
  );
}
