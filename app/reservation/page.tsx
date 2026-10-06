import type { Metadata } from "next";
import Booking from "@/components/Booking";
import PageHero from "@/components/PageHero";
import { events } from "@/lib/data";

export const metadata: Metadata = { title: "Réservation" };

type Props = { searchParams: Promise<{ evenement?: string }> };

export default async function ReservationPage({ searchParams }: Props) {
  const { evenement } = await searchParams;
  const event = events.find((e) => e.slug === evenement);

  return (
    <>
      <PageHero script="Réservez" title="Votre table" image="/images/terrasse-parasols-1.jpg" crumb="Réservation" />
      <section className="section section--dark">
        <div className="container">
          <p className="prose" style={{ marginBottom: 50, color: "#aaa" }}>
            Réservez en ligne en quelques secondes : nous vous rappelons pour confirmer. Pour les groupes de plus de 12
            personnes ou une privatisation, précisez-le dans le message.
          </p>
          <Booking detailed defaultOccasion={event ? `${event.title} — ${event.day} ${event.month}` : undefined} />
        </div>
      </section>
    </>
  );
}
