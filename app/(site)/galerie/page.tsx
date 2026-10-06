import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import PageHero from "@/components/PageHero";
import { getPhotos } from "@/lib/queries";

export const metadata: Metadata = { title: "Galerie" };

export default async function GaleriePage() {
  const photos = await getPhotos();
  return (
    <>
      <PageHero script="Découvrez" title="Notre galerie" image="/images/ponton-detente.jpg" crumb="Galerie" />
      <section className="section section--dark">
        <div className="container" style={{ maxWidth: 1400 }}>
          <Gallery photos={photos} filterable />
        </div>
      </section>
    </>
  );
}
