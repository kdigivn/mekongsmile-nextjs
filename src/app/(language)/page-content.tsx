import Link from "@/components/link-base";
import Image from "next/image";
import { Star, Clock, Shield } from "lucide-react";
import type { TourCard, PostCard, TourConstant, Destination } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import FeaturedToursSection from "@/views/homepage/featured-tours-section";
import DestinationCardsSection from "@/views/homepage/destination-cards-section";
import StatsCounterSection from "@/views/homepage/stats-counter-section";

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
      <h2 className="mb-6 text-center font-heading text-2xl font-bold">Why Choose Us</h2>
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

function LatestPostsSection({ posts }: { posts: PostCard[] }) {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="section-spacing">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">Travel Blog</h2>
        <Link href="/blog/" className="text-sm font-medium text-primary hover:underline">
          View all posts
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <Link key={post.databaseId} href={`/blog/${post.slug}/`} className="group block">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
              {post.featuredImage?.node && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText ?? post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p
                    className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(post.excerpt) }}
                  />
                )}
              </div>
            </div>
          </Link>
        ))}
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
      <LatestPostsSection posts={posts} />
    </div>
  );
}
