import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuTabs from "@/components/MenuTabs";
import PageHero from "@/components/PageHero";
import { getMenu } from "@/lib/queries";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const menu = await getMenu();
  return (
    <>
      <PageHero script="Découvrez" title="Notre carte" image="/images/terrasse-repas.jpg" crumb="Menu" />
      <section className="menu-section" style={{ paddingTop: 80 }}>
        <p className="prose" style={{ marginBottom: 50 }}>
          Poissons de l&apos;Oubangui braisés au feu de bois, recettes centrafricaines et grillades à partager. Prix en
          francs CFA, service compris.
        </p>
        <div className="menu-section__band" style={{ "--band-image": "url(/images/salle-vue-fleuve.jpg)" } as React.CSSProperties}>
          <MenuTabs menu={menu} />
        </div>
      </section>
      <section className="cta-band">
        <Image src="/images/ponton-parasol.jpg" alt="" fill sizes="(max-width: 700px) 50vw, 33vw" />
        <div className="cta-band__content container">
          <span className="section-title__script">Groupes &amp; fêtes</span>
          <h2 className="section-title__main">Menus sur mesure</h2>
          <p className="mt-40">
            Mariages, anniversaires, séminaires : notre équipe compose un buffet ou un menu adapté à votre budget.
          </p>
          <Link href="/contact" className="btn btn--outline">
            Demander un devis
          </Link>
        </div>
      </section>
    </>
  );
}
