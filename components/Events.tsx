import Image from "next/image";
import Link from "next/link";
import type { EventItem } from "@/lib/data";

function DateBadge({ e }: { e: EventItem }) {
  return (
    <div className="date-badge">
      <div className="date-badge__day">{e.day}</div>
      <div className="date-badge__month">{e.month}</div>
    </div>
  );
}

export function EventRow({ e, withDescription = false }: { e: EventItem; withDescription?: boolean }) {
  return (
    <article className="event" id={e.slug}>
      <div className="event__media">
        <Image src={e.image} alt="" fill sizes="200px" />
        <DateBadge e={e} />
      </div>
      <div className="event__body">
        <h3 className="event__title">{e.title}</h3>
        <div className="event__meta">
          <span>{e.place}</span>
          <span>{e.time}</span>
        </div>
        {withDescription && <p className="event__desc">{e.description}</p>}
        <Link href={`/reservation?evenement=${e.slug}`} className="event__link">
          Réserver ma place
        </Link>
      </div>
    </article>
  );
}

export function EventFeature({ e }: { e: EventItem }) {
  return (
    <article className="event event--feature" id={e.slug}>
      <Image src={e.image} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
      <div className="event__card">
        <DateBadge e={e} />
        <h3 className="event__title">{e.title}</h3>
        <div className="event__meta">
          <span>{e.place}</span>
          <span>{e.time}</span>
        </div>
        <p className="event__desc">{e.description}</p>
        <Link href={`/reservation?evenement=${e.slug}`} className="event__link" style={{ display: "inline-block" }}>
          Réserver ma place
        </Link>
      </div>
    </article>
  );
}

export default function Events({ events }: { events: EventItem[] }) {
  const [feature, ...rest] = [events[events.length - 1], ...events.slice(0, -1)];
  return (
    <div className="events">
      <div className="events__stack">
        {rest.map((e) => (
          <EventRow key={e.slug} e={e} />
        ))}
      </div>
      <EventFeature e={feature} />
    </div>
  );
}
