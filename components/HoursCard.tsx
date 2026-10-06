import { hours, site } from "@/lib/data";

export default function HoursCard() {
  return (
    <aside className="hours">
      <div className="hours__inner on-dark">
        <div className="section-title" style={{ marginBottom: 0 }}>
          <span className="section-title__script" style={{ fontSize: 36 }}>
            Horaires
          </span>
          <h2 className="section-title__main" style={{ fontSize: 20 }}>
            Ouverture
          </h2>
        </div>
        {hours.map((h) => (
          <div className="hours__group" key={h.days}>
            <div className="hours__days">{h.days}</div>
            {h.slots.map((s) => (
              <div key={s}>{s}</div>
            ))}
          </div>
        ))}
        <div className="hours__phone">{site.phone}</div>
      </div>
    </aside>
  );
}
