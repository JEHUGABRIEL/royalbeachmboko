import { site } from "@/lib/data";

export default function MapEmbed({ overlap = false }: { overlap?: boolean }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=13&output=embed`;
  return (
    <div className={`map${overlap ? " map--overlap" : ""}`}>
      <iframe src={src} title={`Carte — ${site.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="map__card">
        <strong>{site.name}</strong>
        <br />
        {site.address}
        <br />
        Tél. {site.phone}
      </div>
    </div>
  );
}
