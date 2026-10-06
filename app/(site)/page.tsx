import Image from "next/image";
import Link from "next/link";
import Booking from "@/components/Booking";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import HeroSlider from "@/components/HeroSlider";
import MapEmbed from "@/components/MapEmbed";
import MenuTabs from "@/components/MenuTabs";
import SectionTitle from "@/components/SectionTitle";
import Testimonials from "@/components/Testimonials";
import { getMenu, getPhotos, getUpcomingEvents } from "@/lib/queries";

export const revalidate = 3600;

export default async function Home() {
  const [menu, photos, events] = await Promise.all([getMenu(), getPhotos(), getUpcomingEvents()]);
  return (
    <>
      <HeroSlider />

      <section className="split">
        <div className="split__text">
          <div className="framed">
            <SectionTitle script="Découvrez" title="Notre maison" />
            <p>
              Au bord de l&apos;Oubangui, à Mbocko, Royal Beach vous accueille pour un déjeuner les pieds dans le sable,
              un dîner face au coucher du soleil ou une grande fête entre amis. Poissons braisés, recettes centrafricaines
              et boissons bien fraîches, servis dans un jardin tropical.
            </p>
            <div className="signature">
              <div className="signature__avatar">
                <Image src="/images/salon-rotin.jpg" alt="" fill sizes="64px" />
              </div>
              <span className="signature__name">L&apos;équipe Royal Beach</span>
              <span className="signature__role">Mbocko · RCA</span>
            </div>
            <div className="mt-40">
              <Link href="/a-propos" className="btn btn--dark">
                Découvrir le lieu
              </Link>
            </div>
          </div>
        </div>
        <div className="split__image">
          <Image src="/images/terrasse-salon-riviere.jpg" alt="Salon de terrasse face à l'Oubangui" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
      </section>

      <section className="menu-section">
        <SectionTitle script="Découvrez" title="Notre carte" />
        <div className="menu-section__band" style={{ "--band-image": "url(/images/terrasse-repas.jpg)" } as React.CSSProperties}>
          <MenuTabs menu={menu} limit={6} showFooter />
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: 60 }}>
        <div className="container">
          <Booking />
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: 20 }}>
        <SectionTitle script="Découvrez" title="Notre galerie" />
        <div style={{ padding: "0 10px" }}>
          <Gallery photos={photos.slice(0, 8)} />
        </div>
        <div className="center mt-40">
          <Link href="/galerie" className="btn btn--light">
            Voir toute la galerie
          </Link>
        </div>
      </section>

      <section className="section section--dark" style={{ paddingTop: 20, background: "#262626" }}>
        <div className="container">
          <SectionTitle script="À venir" title="Nos événements" />
          <Events events={events.slice(0, 3)} />
        </div>
      </section>

      <section className="section section--dark" style={{ paddingBottom: 0 }}>
        <div className="container">
          <Testimonials />
        </div>
      </section>
      <MapEmbed overlap />
    </>
  );
}
