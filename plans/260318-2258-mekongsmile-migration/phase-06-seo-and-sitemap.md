# Phase 6: SEO & Sitemap

## Context Links
- [Plan Overview](./plan.md)
- [SEO Fragment](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/fragments/seo.ts)
- [SEO Types](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/types.ts) (SeoData, SeoOpenGraph)
- [Current Sitemap](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/app/sitemap.ts)
- [Current seo-utils](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/lib/utils/seo-utils.ts)

## Overview
- **Priority:** P2
- **Status:** completed
- **Effort:** 3h
- **Description:** Add `generateMetadata()` to every route using Rank Math SEO data from WPGraphQL. Rewrite sitemap.ts for new URL structure. Add JSON-LD structured data. Create robots.ts.

## Key Insights
- Rank Math SEO plugin confirmed installed on WP backend
- `seo` field available on all Post/Product/Page types via GraphQL
- `seo.jsonLd.raw` contains pre-built JSON-LD from Rank Math -- inject as-is
- `seo.openGraph.image.url` for OG images
- `seo.breadcrumbs` for breadcrumb navigation
- Existing `seo-utils.ts` has `setSeoData()` helper -- adapt for new SeoData type
- Current sitemap uses `generateSitemaps()` with ID-based splitting -- solid pattern, keep

## Requirements

### Functional
- Every page has proper title, description, OG tags from Rank Math
- JSON-LD structured data on tour detail pages (Product schema) and blog posts (Article schema)
- XML sitemap with sections: tours, posts, pages, destinations
- robots.txt allowing all crawlers
- Breadcrumb component using `seo.breadcrumbs`

### Non-Functional
- SEO metadata fetched server-side in `generateMetadata()`
- No client-side metadata generation

## Related Code Files

### Modify
- `src/app/(language)/page.tsx` -- add generateMetadata for homepage
- `src/app/(language)/tours/page.tsx` -- add generateMetadata
- `src/app/(language)/tour/[slug]/page.tsx` -- add generateMetadata + JSON-LD
- `src/app/(language)/blog/page.tsx` -- add generateMetadata
- `src/app/(language)/blog/[slug]/page.tsx` -- add generateMetadata + JSON-LD
- `src/app/(language)/destination/[slug]/page.tsx` -- add generateMetadata
- `src/app/(language)/news/page.tsx` -- add generateMetadata
- `src/app/(language)/news/[slug]/page.tsx` -- add generateMetadata
- `src/app/(language)/about-us/page.tsx` -- add generateMetadata
- `src/app/(language)/contact-us/page.tsx` -- add generateMetadata
- `src/app/(language)/[...slug]/page.tsx` -- add generateMetadata
- `src/app/sitemap.ts` -- complete rewrite
- `src/lib/utils/seo-utils.ts` -- adapt for new SeoData type

### Create
- `src/app/robots.ts`
- `src/components/breadcrumb.tsx` (if not exists)

## Implementation Steps

### 1. Create SEO helper function

Adapt `seo-utils.ts` to work with new `SeoData` type:
```ts
import type { SeoData } from "@/graphql/types";
import { Metadata } from "next";

export function seoToMetadata(seo: SeoData | undefined, fallback: { title: string; description: string }): Metadata {
  if (!seo) return { title: fallback.title, description: fallback.description };
  return {
    title: seo.title || fallback.title,
    description: seo.description || fallback.description,
    openGraph: {
      title: seo.openGraph?.title || seo.title || fallback.title,
      description: seo.openGraph?.description || seo.description || "",
      images: seo.openGraph?.image ? [{ url: seo.openGraph.image.url }] : [],
      type: (seo.openGraph?.type as "website" | "article") || "website",
    },
    alternates: { canonical: seo.canonical || undefined },
  };
}
```

### 2. Add generateMetadata to each route

Pattern for tour detail:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const tour = await getTourBySlug(params.slug);
  return seoToMetadata(tour?.seo, { title: tour?.name || "Tour", description: "" });
}
```

### 3. Add JSON-LD to detail pages

Tour detail -- inject `seo.jsonLd.raw` from Rank Math:
```tsx
{tour.seo?.jsonLd?.raw && (
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: tour.seo.jsonLd.raw }}
  />
)}
```

### 4. Rewrite sitemap.ts

```ts
export async function generateSitemaps() {
  return [{ id: "tours" }, { id: "posts" }, { id: "pages" }, { id: "destinations" }];
}

export default async function sitemap({ id }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  switch (id) {
    case "tours":
      const tourSlugs = await getAllTourSlugs();
      return tourSlugs.map(t => ({ url: `${baseUrl}/tour/${t.slug}/`, priority: 0.9 }));
    case "posts":
      const { nodes: posts } = await getAllBlogPosts(200);
      return posts.map(p => ({ url: `${baseUrl}/blog/${p.slug}/`, priority: 0.7 }));
    case "destinations":
      const { nodes: dests } = await getAllDestinations();
      return dests.flatMap(d => [
        { url: `${baseUrl}/destination/${d.slug}/`, priority: 0.8 },
        ...(d.children?.nodes || []).map(c => ({ url: `${baseUrl}/destination/${c.slug}/`, priority: 0.8 })),
      ]);
    case "pages":
      const { nodes: pages } = await getAllPages();
      return pages.filter(p => !p.isFrontPage).map(p => ({
        url: `${baseUrl}/${p.slug}/`, priority: 0.6,
      }));
    default: return [];
  }
}
```

### 5. Create robots.ts

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/user/"] },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
```

### 6. Update next.config.js rewrites

Update sitemap rewrites to match new IDs:
```js
{ source: "/tour-sitemap.xml", destination: "/sitemap/tours.xml" },
{ source: "/post-sitemap.xml", destination: "/sitemap/posts.xml" },
{ source: "/page-sitemap.xml", destination: "/sitemap/pages.xml" },
{ source: "/destination-sitemap.xml", destination: "/sitemap/destinations.xml" },
```

## Todo List
- [ ] Adapt `seo-utils.ts` for new SeoData type
- [ ] Add `generateMetadata()` to all route pages
- [ ] Add JSON-LD injection to tour detail and blog detail pages
- [ ] Rewrite `sitemap.ts` for new URL structure
- [ ] Create `robots.ts`
- [ ] Update sitemap rewrites in `next.config.js`
- [ ] Create breadcrumb component using `seo.breadcrumbs`
- [ ] Verify OG tags render correctly (use OG debugger)
- [ ] Verify sitemap XML outputs correct URLs

## Success Criteria
- Every page has proper `<title>`, `<meta description>`, OG tags
- `/sitemap.xml` lists all tours, posts, pages, destinations
- `/robots.txt` returns valid robots file
- JSON-LD present on tour and blog detail pages
- Google Search Console validates sitemap

## Risk Assessment
- **Rank Math data incomplete** -- some posts/pages may lack SEO data; fallback to title/excerpt
- **JSON-LD raw string may contain WP internal URLs** -- need to replace `mekongsmile.com` WordPress URLs with frontend URLs in jsonLd.raw (reuse `wpURLtoNextURL` pattern)

## Next Steps
-> Phase 7: Search & Filtering
