import Link from "next/link";
import { hours, nav, site } from "@/lib/data";
import Logo from "./Logo";
import Socials from "./Socials";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p>
            Restaurant, bar et plage au bord de l&apos;Oubangui. Cuisine centrafricaine et grillades, terrasses ombragées,
            aire de jeux et soirées face au fleuve.
          </p>
          <p>
            {site.address}
            <br />
            {site.phone} · {site.email}
          </p>
        </div>
        <div>
          <h4>Horaires</h4>
          <ul>
            {hours.map((h) => (
              <li key={h.days}>
                <strong style={{ color: "#bbb" }}>{h.days}</strong>
                <br />
                {h.slots.join(" · ")}
              </li>
            ))}
          </ul>
          <h4 className="mt-40">Plan du site</h4>
          <ul style={{ columns: 2 }}>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Newsletter</h4>
          <Newsletter />
          <div className="footer__follow">
            Suivez-nous <Socials />
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {site.name} — {site.country}</span>
        <span>Mbocko · Bimbo · Bangui</span>
      </div>
    </footer>
  );
}
