import HoursCard from "./HoursCard";
import ReservationForm from "./ReservationForm";
import SectionTitle from "./SectionTitle";

type Props = { detailed?: boolean; defaultOccasion?: string };

export default function Booking({ detailed = false, defaultOccasion }: Props) {
  return (
    <div className="booking">
      <HoursCard />
      <div className="booking__form">
        <SectionTitle script="Réservation" title="En ligne" />
        <ReservationForm detailed={detailed} defaultOccasion={defaultOccasion} />
      </div>
    </div>
  );
}
