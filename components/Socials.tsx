import { FacebookIcon, InstagramIcon, WhatsappIcon } from "./Icons";

export type SocialLinks = { facebook: string; instagram: string; whatsapp: string };

export default function Socials({ facebook, instagram, whatsapp }: SocialLinks) {
  const wa = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  return (
    <div className="socials">
      {facebook && (
        <a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
          <FacebookIcon />
        </a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
      )}
      {whatsapp && (
        <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsappIcon />
        </a>
      )}
    </div>
  );
}
