import Link from "next/link";
import Icon from "./icons";

export default function BackToSite() {
  return (
    <Link href="/" className="back-to-site">
      <Icon name="left" size={16} />
      Retour au site
    </Link>
  );
}
