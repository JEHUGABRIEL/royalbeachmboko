import { site } from "@/lib/data";
import { getSettings } from "@/lib/queries";

export default async function MapEmbed({ overlap = false }: { overlap?: boolean }) {
  const s = await getSettings();
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=13&output=embed`;
  return (
    <div className={`map${overlap ? " map--overlap" : ""}`}>
      <iframe src={src} title={`Carte — ${site.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="map__card">
        <strong>{site.name}</strong>
        <br />
        {s.address}
        <br />
        Tél. {s.phone}
      </div>
    </div>
  );
}
