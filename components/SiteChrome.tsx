import { getSettings } from "@/lib/queries";
import Footer from "./Footer";
import Header from "./Header";
import Splash from "./Splash";

export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const socials = { facebook: s.facebook, instagram: s.instagram, whatsapp: s.whatsapp };
  return (
    <>
      <Splash />
      <Header socials={socials} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
