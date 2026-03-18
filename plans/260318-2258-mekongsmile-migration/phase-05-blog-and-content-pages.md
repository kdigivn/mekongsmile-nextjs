# Phase 5: Blog & Content Pages

## Context Links
- [Plan Overview](./plan.md)
- [Blog Queries](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/blog/)
- [Page Queries](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/site/getPages.ts)
- [Current Catch-All](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/app/(language)/[...slug]/page.tsx)
- [Existing Blog Views](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/views/blog/)
- [Existing Post Views](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/views/post/)

## Overview
- **Priority:** P2
- **Status:** complete
- **Effort:** 4h
- **Description:** Build blog listing, blog detail, news listing, news detail, and static content pages (about-us, contact-us, FAQ). Simplify catch-all route. Heavily reuse existing `src/views/post/` and `src/views/blog/` components.

## Key Insights
- Existing blog/post views are largely reusable -- change data fetching, keep rendering
- News is just posts filtered by `categoryName: "news"` -- separate route for SEO
- `GET_ALL_BLOG_POSTS` has 3 variants: all posts, by category, by destination
- `GET_POST_BY_SLUG` returns full PostDetail with SEO, author, tags, content
- `GET_PAGE_BY_SLUG` uses `idType: URI` -- works for nested page URIs too
- WP comments/ratings system kept -- existing `comments-section.tsx` and `rating-section.tsx` reusable
- Current catch-all `[...slug]/page.tsx` is 597 lines handling pages, posts, products, terms, categories -- needs simplification since tours/destinations now have dedicated routes

## Requirements

### Functional
- `/blog/` -- paginated blog listing with category filter chips
- `/blog/[slug]/` -- full post detail with comments, ratings, sidebar
- `/news/` -- news category posts listing
- `/news/[slug]/` -- news post detail (same layout as blog detail)
- `/about-us/` -- static page from WP
- `/contact-us/` -- static page from WP with contact form
- `/[...slug]/` -- catch-all for remaining WP pages (FAQ, terms, privacy, etc.)

### Non-Functional
- Blog posts statically generated at build; ISR 3600s
- Comment submission via WP REST API (existing pattern)

## Architecture

### Route Structure
```
src/app/(language)/
  blog/
    page.tsx                     # Blog listing
    [slug]/
      page.tsx                   # Blog post detail
  news/
    page.tsx                     # News listing
    [slug]/
      page.tsx                   # News post detail
  about-us/
    page.tsx                     # Static page
  contact-us/
    page.tsx                     # Static page + contact form
  [...slug]/
    page.tsx                     # Catch-all (simplified)
```

## Related Code Files

### Reuse (adapt data source only)
- `src/views/blog/blog-view.tsx` -- blog listing layout
- `src/views/blog/blog-category-view.tsx` -- category filter
- `src/views/post/post-detail/post-detail-view.tsx` -- post detail layout
- `src/views/post/comments-section.tsx` -- WP comments
- `src/views/post/rating-section.tsx` -- star ratings
- `src/views/post/latest-posts-section.tsx` -- sidebar latest posts
- `src/views/post/contact-form-section.tsx` -- contact form

### Create
- `src/app/(language)/blog/page.tsx`
- `src/app/(language)/blog/[slug]/page.tsx`
- `src/app/(language)/news/page.tsx`
- `src/app/(language)/news/[slug]/page.tsx`
- `src/app/(language)/about-us/page.tsx`
- `src/app/(language)/contact-us/page.tsx`

### Modify
- `src/app/(language)/[...slug]/page.tsx` -- simplify dramatically (pages only, no products/terms)
- `src/views/post/post-detail/post-detail-view.tsx` -- adapt props for new PostDetail type
- `src/views/blog/blog-view.tsx` -- adapt props for new PostCard[] type

## Implementation Steps

### 1. Blog Listing (`/blog/`)

```ts
import { getAllBlogPosts } from "@/services/wordpress";
import type { GetAllBlogPostsResponse } from "@/graphql/types";

export default async function BlogPage() {
  const { nodes: posts, pageInfo } = await getAllBlogPosts(12);
  return <BlogView posts={posts} pageInfo={pageInfo} />;
}
```

### 2. Blog Detail (`/blog/[slug]/`)

```ts
import { getPostBySlug } from "@/services/wordpress";

export async function generateStaticParams() {
  const { nodes } = await getAllBlogPosts(100);
  return nodes.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  return <PostDetailView post={post} />;
}
```

### 3. News Pages

Same pattern as blog, using `getNews()` query (filters by `categoryName: "news"`).

### 4. Static Pages (about-us, contact-us)

```ts
// src/app/(language)/about-us/page.tsx
import { getPageBySlug } from "@/services/wordpress";

export default async function AboutPage() {
  const page = await getPageBySlug("about-us");
  if (!page) notFound();
  return (
    <article className="prose max-w-4xl mx-auto py-8"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
    />
  );
}
```

### 5. Simplify Catch-All (`[...slug]/page.tsx`)

Reduce from 597 lines to ~50 lines. Only handle:
1. WP pages by slug
2. 404 for everything else

Tours, destinations, blog, news all have dedicated routes now.

```ts
export default async function CatchAllPage({ params }) {
  const slug = params.slug.join("/");
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return <DefaultPage page={page} />;
}
```

### 6. Adapt existing view components

Update `PostDetailView` props:
- Old: accepts `Post` type from `src/services/infrastructure/wordpress/types/post.ts`
- New: accepts `PostDetail` type from `graphql/types.ts`
- Key differences: field names may vary slightly. Create adapter function if needed, or update component directly.

Similarly for `BlogView`:
- Old: accepts `Post[]`
- New: accepts `PostCard[]`

## Todo List
- [x] Create `/blog/page.tsx`
- [x] Create `/blog/[slug]/page.tsx`
- [x] Create `/news/page.tsx`
- [x] Create `/news/[slug]/page.tsx`
- [x] Create `/about-us/page.tsx`
- [x] Create `/contact-us/page.tsx`
- [x] Simplify `[...slug]/page.tsx` to pages-only catch-all
- [x] Create new `BlogPostsGridView` for PostCard[] type (in `src/views/blog/`)
- [x] Create new `PostDetailNewView` for PostDetail type (in `src/views/post/post-detail-new/`)
- [x] Create new `WpPageContentView` for PageData type (in `src/views/page/`)
- [x] Verify comments/ratings still work (requires live data test)
- [x] Test all blog post pages render with live data

## Success Criteria
- `/blog/` shows paginated posts
- `/blog/[slug]/` renders post with comments + ratings
- `/news/` shows news category posts
- `/about-us/` and `/contact-us/` render WP page content
- Catch-all handles remaining WP pages (FAQ, terms, privacy)
- 404 for non-existent slugs

## Risk Assessment
- **Type mismatch between old Post and new PostDetail** -- field names/shapes may differ. Use TypeScript compiler to catch. May need adapter layer.
- **WP comments API** -- existing comment system uses WP REST endpoints; verify those still work on mekongsmile.com backend
- **Contact form** -- if using CF7 or similar WP plugin, verify API endpoint exists

## Next Steps
-> Phase 6: SEO & Sitemap (needs all pages to exist)
