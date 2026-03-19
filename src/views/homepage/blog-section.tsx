import Link from "@/components/link-base";
import Image from "next/image";
import SectionHeading from "@/components/ui/section-heading";
import type { PostCard } from "@/graphql/types";

type Props = { posts: PostCard[] };

export default function BlogSection({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  const [featured, ...rest] = posts.slice(0, 3);
  const sidePosts = rest.slice(0, 2);

  return (
    <section className="section-spacing">
      <div className="mb-8 flex items-center justify-between">
        <SectionHeading
          chip="Blog"
          title="Stories from the Mekong"
          emphasisWord="Mekong"
          className="mb-0"
        />
        <Link
          href="/blog/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Read More &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Featured post — large card */}
        <Link
          href={`/blog/${featured.slug}/`}
          className="group col-span-1 overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-cardHover lg:col-span-2"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            {featured.featuredImage?.node && (
              <Image
                src={featured.featuredImage.node.sourceUrl}
                alt={featured.featuredImage.node.altText ?? featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            )}
            {featured.categories?.nodes?.[0] && (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                {featured.categories.nodes[0].name}
              </span>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-heading text-xl font-bold line-clamp-2 transition-colors group-hover:text-primary">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p
                className="mt-2 text-sm text-muted-foreground line-clamp-2"
                dangerouslySetInnerHTML={{ __html: featured.excerpt }}
              />
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {featured.date &&
                new Date(featured.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </p>
          </div>
        </Link>

        {/* Side posts — stacked */}
        <div className="flex flex-col gap-6">
          {sidePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group flex gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-cardHover"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                {post.featuredImage?.node && (
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText ?? post.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-heading text-sm font-semibold line-clamp-2 transition-colors group-hover:text-primary">
                  {post.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.date &&
                    new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
