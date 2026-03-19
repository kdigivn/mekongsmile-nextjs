import Link from "@/components/link-base";
import type { TourCard } from "@/graphql/types";
import TourCardComponent from "@/views/tour/tour-card";
import SectionHeading from "@/components/ui/section-heading";

type Props = {
  tours: TourCard[];
};

export default function FeaturedToursSection({ tours }: Props) {
  if (!tours || tours.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeading
          chip="Tours"
          title="Featured Experiences"
          emphasisWord="Experiences"
          className="mb-0"
        />
        <Link
          href="/tours/"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all tours
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.slice(0, 6).map((tour) => (
          <TourCardComponent key={tour.databaseId} tour={tour} />
        ))}
      </div>
    </section>
  );
}
