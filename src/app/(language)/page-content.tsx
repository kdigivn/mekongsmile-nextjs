import { Star, Clock, Shield } from "lucide-react";
import type { TourCard, PostCard, TourConstant, Destination } from "@/graphql/types";
import SectionHeading from "@/components/ui/section-heading";
import FeaturedToursSection from "@/views/homepage/featured-tours-section";
import DestinationCardsSection from "@/views/homepage/destination-cards-section";
import StatsCounterSection from "@/views/homepage/stats-counter-section";
import BlogSection from "@/views/homepage/blog-section";

type Props = {
  tours: TourCard[];
  posts: PostCard[];
  tourConstant: TourConstant | null;
  destinations: Destination[];
};

const WHY_ICONS = [Star, Clock, Shield];

function WhyChooseSection({ items }: { items: TourConstant["whyChooseUs"] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="section-spacing">
      <SectionHeading
        chip="About Us"
        title="Why Choose Mekong Smile"
        emphasisWord="Mekong Smile"
        centered
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const Icon = WHY_ICONS[idx % WHY_ICONS.length];
          return (
            <div key={idx} className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">{item.headline}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePageContent({ tours, posts, tourConstant, destinations }: Props) {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      <FeaturedToursSection tours={tours} />
      <DestinationCardsSection destinations={destinations} />
      {tourConstant && <WhyChooseSection items={tourConstant.whyChooseUs} />}
      <StatsCounterSection />
      <BlogSection posts={posts} />
    </div>
  );
}
