/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { PostCard } from "@/graphql/types";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { CiCalendar } from "react-icons/ci";
import { removeSquareBracketsInExcerpt } from "@/lib/utils";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";

// Tiny SVG blur placeholder for blog post images
const BLOG_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

type Props = {
  posts: PostCard[];
  basePath?: string; // "/blog" or "/news"
};

const BlogPostsGridView = ({ posts, basePath = "/blog" }: Props) => {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-default-500">No posts found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCardItem key={post.databaseId} post={post} basePath={basePath} />
      ))}
    </div>
  );
};

const PostCardItem = ({
  post,
  basePath,
}: {
  post: PostCard;
  basePath: string;
}) => {
  const href = `${basePath}/${post.slug}/`;
  const category = post.categories?.nodes?.[0];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="group block overflow-hidden rounded-lg">
        <Image
          src={
            post.featuredImage?.node.sourceUrl ||
            "/static-img/placeholder-image-700x394.png"
          }
          alt={post.title}
          width={700}
          height={394}
          className="aspect-video w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          unoptimized
          placeholder="blur"
          blurDataURL={BLOG_BLUR_PLACEHOLDER}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-col gap-2">
        {category && (
          <span className="w-fit rounded-lg bg-primary-100 px-2 py-1 text-xs text-primary">
            {category.name}
          </span>
        )}

        <Link
          href={href}
          className="line-clamp-2 text-base font-bold text-black transition-colors hover:text-primary"
        >
          {post.title}
        </Link>

        {post.excerpt && (
          <div
            className="line-clamp-3 text-sm text-default-600"
            dangerouslySetInnerHTML={{
              __html: sanitizeCmsHtml(removeSquareBracketsInExcerpt(post.excerpt)),
            }}
          />
        )}

        <div className="flex items-center gap-1 text-sm text-default-500">
          <CiCalendar className="h-4 w-4" />
          <span>{format(new Date(post.date), "dd/MM/yyyy")}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogPostsGridView;
