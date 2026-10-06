import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import Socials from "@/components/Socials";
import { hours, site } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero script="Écrivez-nous" title="Contact" image="/images/vue-oubangui.jpg" crumb="Contact" />
      <section className="section section--dark">
        <div className="container contact-grid">
          <div className="contact-info on-dark">
            <SectionTitle script="Infos" title="Nous trouver" align="left" />
            <dl>
              <dt>Adresse</dt>
              <dd>{site.address}</dd>
              <dt>Téléphone / WhatsApp</dt>
              <dd>{site.phone}</dd>
              <dt>E-mail</dt>
              <dd>{site.email}</dd>
              <dt>Horaires</dt>
              {hours.map((h) => (
                <dd key={h.days} style={{ marginBottom: 8 }}>
                  {h.days} : {h.slots.join(" · ")}
                </dd>
              ))}
            </dl>
            <div style={{ marginTop: 24 }}>
              <Socials />
            </div>
          </div>
          <div className="contact-form">
            <SectionTitle script="Message" title="Contactez-nous" />
            <ContactForm />
          </div>
        </div>
      </section>
      <MapEmbed />
    </>
  );
}
