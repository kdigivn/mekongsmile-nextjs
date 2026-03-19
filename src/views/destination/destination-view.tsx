import Link from "@/components/link-base";
import Image from "next/image";
import type { Destination, TourCard, PostCard } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import TourCardComponent from "@/views/tour/tour-card";
import BreadcrumbNav from "@/components/breadcrumb-nav";

type Props = {
  destination: Destination & {
    products: { nodes: TourCard[] };
    posts: { nodes: PostCard[] };
  };
};

export default function DestinationView({ destination }: Props) {
  const tours = destination.products?.nodes ?? [];
  const posts = destination.posts?.nodes ?? [];

  const breadcrumbItems = [
    { label: "Destinations", href: "/tours/" },
    ...(destination.parent?.node
      ? [
          {
            label: destination.parent.node.name,
            href: `/destination/${destination.parent.node.slug}/`,
          },
        ]
      : []),
    { label: destination.name },
  ];

  return (
    <div className="w-full">
      {/* Hero header */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary to-secondary md:h-64">
        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <div className="text-white">
            <BreadcrumbNav items={breadcrumbItems} />
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {destination.name}
            </h1>
            {destination.count && (
              <p className="mt-1 text-white/80">
                {destination.count} tours available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-xl px-4 py-8 md:px-8">
        {/* Description */}
        {destination.description && (
          <p className="mb-8 max-w-2xl text-muted-foreground">
            {destination.description}
          </p>
        )}

        {/* Child destinations as pill chips */}
        {destination.children?.nodes && destination.children.nodes.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Sub-Destinations</h2>
            <div className="flex flex-wrap gap-2">
              {destination.children.nodes.map((child) => (
                <Link
                  key={child.databaseId}
                  href={`/destination/${child.slug}/`}
                  className="rounded-full border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/5 transition-colors"
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
                <div key={tour.databaseId} className="rounded-2xl overflow-hidden">
                  <TourCardComponent tour={tour} />
                </div>
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
                  <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md">
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
    </div>
  );
}
