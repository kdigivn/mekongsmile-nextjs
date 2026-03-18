import Link from "@/components/link-base";
import Image from "next/image";
import type { Destination, TourCard, PostCard } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import TourCardComponent from "@/views/tour/tour-card";

type Props = {
  destination: Destination & {
    products: { nodes: TourCard[] };
    posts: { nodes: PostCard[] };
  };
};

export default function DestinationView({ destination }: Props) {
  const tours = destination.products?.nodes ?? [];
  const posts = destination.posts?.nodes ?? [];

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{destination.name}</h1>
        {destination.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {destination.description}
          </p>
        )}
        {destination.parent?.node && (
          <p className="mt-1 text-sm text-muted-foreground">
            Part of{" "}
            <Link
              href={`/destination/${destination.parent.node.slug}/`}
              className="text-primary hover:underline"
            >
              {destination.parent.node.name}
            </Link>
          </p>
        )}
      </div>

      {/* Child destinations */}
      {destination.children?.nodes && destination.children.nodes.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Sub-Destinations</h2>
          <div className="flex flex-wrap gap-2">
            {destination.children.nodes.map((child) => (
              <Link
                key={child.databaseId}
                href={`/destination/${child.slug}/`}
                className="rounded-full border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/5"
              >
                {child.name}
                {child.count !== null && (
                  <span className="ml-1 text-muted-foreground">
                    ({child.count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tours */}
      {tours.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-semibold">
            Tours in {destination.name}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCardComponent key={tour.databaseId} tour={tour} />
            ))}
          </div>
        </div>
      )}

      {/* Blog posts */}
      {posts.length > 0 && (
        <div>
          <h2 className="mb-6 text-xl font-semibold">
            Travel Guides for {destination.name}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.databaseId}
                href={`/blog/${post.slug}/`}
                className="group block"
              >
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
                        dangerouslySetInnerHTML={{
                          __html: sanitizeCmsHtml(
                            post.excerpt.replace(/<[^>]*>/g, "")
                          ),
                        }}
                      />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tours.length === 0 && posts.length === 0 && (
        <p className="text-muted-foreground">
          No tours or posts available for this destination yet.
        </p>
      )}
    </div>
  );
}
