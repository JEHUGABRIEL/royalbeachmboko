import { site } from "@/lib/data";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "./Icons";

export default function Socials() {
  const wa = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  return (
    <div className="socials">
      <a href={site.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
        <FacebookIcon />
      </a>
      <a href={site.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
        <InstagramIcon />
      </a>
      <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <WhatsappIcon />
      </a>
    </div>
  );
}
