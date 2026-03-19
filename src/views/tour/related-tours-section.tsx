import type { TourCard } from "@/graphql/types";
import TourCardComponent from "./tour-card";
import HorizontalScrollCarousel from "@/components/horizontal-scroll-carousel";

type Props = {
  tours: TourCard[];
};

export default function RelatedToursSection({ tours }: Props) {
  if (!tours || tours.length === 0) return null;
  return (
    <section className="section-spacing">
      <h2 className="mb-6 font-heading text-2xl font-bold">You May Also Like</h2>
      <HorizontalScrollCarousel>
        {tours.map((tour) => (
          <div key={tour.databaseId} className="min-w-[300px] max-w-[350px] shrink-0">
            <TourCardComponent tour={tour} />
          </div>
        ))}
      </HorizontalScrollCarousel>
    </section>
  );
}
