import { getSettings } from "@/lib/queries";
import Footer from "./Footer";
import Header from "./Header";

export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const socials = { facebook: s.facebook, instagram: s.instagram, whatsapp: s.whatsapp };
  return (
    <>
      <Header socials={socials} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
