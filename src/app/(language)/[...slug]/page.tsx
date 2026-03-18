/* eslint-disable @arthurgeron/react-usememo/require-usememo */
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import {
  serverAddWordpressPage,
  serverAddWordpressPost,
  serverAddWordpressProduct,
  serverAddWordpressTerm,
} from "@/services/infrastructure/meilisearch/wordpress/wordpress-indexing.service";
import {
  getRouteIdDefault,
  getSideBarItem,
} from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import {
  getCategories,
  getCategoriesBySlug,
} from "@/services/infrastructure/wordpress/queries/getCategories";
import { getLatestPostsSlug } from "@/services/infrastructure/wordpress/queries/getLatestPosts";
import {
  getPageBySlug,
  getPageSlugs,
} from "@/services/infrastructure/wordpress/queries/getPages";
import { getPost } from "@/services/infrastructure/wordpress/queries/getPost";
import {
  getHighLightPosts,
  getPosts,
} from "@/services/infrastructure/wordpress/queries/getPosts";
import {
  getProduct,
  getProductRelatedByPost,
  getProductsByTerm,
  getProductSlug,
} from "@/services/infrastructure/wordpress/queries/getProduct";
import {
  getPostsByTerm,
  getTermByUri,
  getTerms,
  getTotalItem,
} from "@/services/infrastructure/wordpress/queries/getTerms";
import { Category } from "@/services/infrastructure/wordpress/types/category";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { SideBarItem } from "@/services/infrastructure/wordpress/types/sideBar";
import { Term } from "@/services/infrastructure/wordpress/types/term";
import BlogView from "@/views/blog/blog-view";
import ListView from "@/views/list/list-view";
import PostDetailView from "@/views/post/post-detail/post-detail-view";
import ProductDetailView from "@/views/product/product-detail/product-detail-view";
import { Metadata } from "next";
import DefaultPage from "../default-page";
import ListWithTableView from "@/views/list-with-table/list-with-table-view";
import VoyageSchedulePage from "@/views/schedule/voyage-schedule-page";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { notFound } from "next/navigation";

/* eslint-disable @arthurgeron/react-usememo/require-memo */

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.

export const dynamicParams = true; // or false, to 404 on unknown paths
export const revalidate = 3600; // revalidate at most every hour

export async function generateStaticParams() {
  const pageData: {
    slug: string;
    isFrontPage: boolean;
    isPostsPage: boolean;
  }[] = await getPageSlugs();

  const params: { slug: string[] }[] = pageData
    .filter(
      (item) =>
        !item.isFrontPage &&
        item.slug !== "booking" &&
        item.slug !== "transactions"
    )
    .map((item) => ({
      slug: [item.slug],
    }));

  const limit = 1000;
  const order = "DESC";
  const postData: { slug: string }[] = await getLatestPostsSlug({
    limit,
  });

  params.push(
    ...postData.map((item) => ({
      slug: [item.slug],
    }))
  );

  const productData: { slug: string; uri: string }[] = await getProductSlug({
    order,
    limit,
  });

  params.push(
    ...productData.map((item) => ({
      slug: [...item.uri.split("/").filter((segment) => segment !== "")],
    }))
  );

  const termSlugs = await getTerms();

  params.push(
    ...termSlugs.map((item) => ({
      slug: [...item.uri.split("/").filter((segment) => segment !== "")],
    }))
  );

  for (let i = 0; i < termSlugs.length; i++) {
    const item = termSlugs[i];
    const segments = item.uri.split("/").filter((segment) => segment !== "");
    let totalItem = 0;
    if (segments.length < 2 || item.taxonomyName === "category") {
      totalItem = (await getTotalItem(item.taxonomyName, item.uri)) || 0;
    } else {
      totalItem = (await getTotalItem(segments[0], item.uri)) || 0;
    }
    const numberPostsPerPages = Number(process.env.POSTS_PER_PAGES) || 20;
    const totalPage = Math.ceil(totalItem / numberPostsPerPages);
    const paginationConfig = ["category", "tag"];
    if (paginationConfig.includes(item.taxonomyName)) {
      params.push(
        ...Array.from({ length: totalPage }).map((_, index) => ({
          slug: [...segments, "page", (index + 1).toString()],
        }))
      );
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Noindex for pagination pages — structural check: /category/page/2/
  const slugArr = params.slug;
  const isPagination =
    slugArr.length >= 2 &&
    slugArr[slugArr.length - 2] === "page" &&
    !isNaN(Number(slugArr[slugArr.length - 1]));

  if (isPagination) {
    return {
      robots: { index: false, follow: true },
      alternates: {
        canonical: baseUrl + `/${slugArr.join("/")}/`,
      },
    } as Metadata;
  }

  // /blog page return seo is null

  // const postsPage: WordpressPage | null = await getPostsPage();
  // if (postsPage?.slug === params.slug[0]) {
  //   if (postsPage?.seo) {
  //     const metaData = setSeoData(postsPage);
  //     return {
  //       ...metaData,
  //       alternates: {
  //         canonical: baseUrl + "/" + params.slug,
  //       },
  //     } as Metadata;
  //   }

  //   return {
  //     // title,
  //     title: postsPage?.seo.title,
  //     description: postsPage?.seo.description,
  //     alternates: {
  //       canonical: baseUrl + "/" + params.slug,
  //     },
  //   } as Metadata;
  // }

  const page: WordpressPage | null = await getPageBySlug(params.slug[0]);
  // const title = page?.title ?? "Default Title";

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/" + params.slug,
        },
      } as Metadata;
    }

    return {
      // title,
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + "/" + params.slug,
      },
    } as Metadata;
  }

  if (params.slug.length > 1 && params.slug[0] === "product") {
    const product: Product | null = await getProduct({ slug: params.slug[1] });
    if (product) {
      const seoTitle = product.seo?.title || product.title || "Product";
      const seoDescription =
        product.seo?.description ||
        product.excerpt?.replace(/<[^>]*>/g, "").trim() ||
        "";
      const seoImage = product.featuredImage?.node?.sourceUrl || "";

      const metaData = product.seo ? setSeoData(product) : {};

      return {
        ...metaData,
        title: (metaData as Record<string, unknown>).title || seoTitle,
        description:
          (metaData as Record<string, unknown>).description || seoDescription,
        openGraph: {
          ...(((metaData as Record<string, unknown>).openGraph as Record<
            string,
            unknown
          >) || {}),
          type: "website",
          images: seoImage ? [{ url: seoImage }] : undefined,
        },
        alternates: {
          canonical: baseUrl + `/${params.slug.join("/")}/`,
        },
      } as Metadata;
    }
  }

  const post: Post | null = await getPost({ slug: params.slug[0] });
  // const title = page?.title ?? "Default Title";

  if (post) {
    if (post?.seo) {
      const metaData = setSeoData(post);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/" + params.slug,
        },
      } as Metadata;
    }

    return {
      // title,
      title: post?.seo.title,
      description: post?.seo.description,
      alternates: {
        canonical: baseUrl + "/" + params.slug,
      },
    } as Metadata;
  }

  let uri = `/${params.slug.join("/")}/`;

  if (
    params.slug.length > 1 &&
    params.slug[params.slug.length - 2] === "page"
  ) {
    uri = `/${params.slug.slice(0, -2).join("/")}/`;
  }
  const termNode: Term | undefined = await getTermByUri(uri);

  if (termNode) {
    if (termNode?.seo) {
      const metaData = setSeoData(termNode);
      if (params.slug[params.slug.length - 2] === "page") {
        const titles = metaData?.title?.split("|") || [];
        if (titles.length === 2) {
          return {
            ...metaData,
            title:
              titles[0] +
              `- Trang ${params.slug[params.slug.length - 1]}` +
              titles[1],
          } as Metadata;
        }
        return {
          ...metaData,
        } as Metadata;
      } else {
        return {
          ...metaData,
          alternates: {
            canonical: baseUrl + uri,
          },
        } as Metadata;
      }
    }

    return {
      // title,
      title: termNode?.taxonomyName,
      description: termNode?.taxonomyName,
      alternates: {
        canonical: baseUrl + uri,
      },
    } as Metadata;
  }
  return notFound();
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  // render the posts page if the slug matches the posts page slug
  // current blog page is /blog
  const postsPage: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.BLOG
  );

  if (postsPage?.slug === params.slug[0]) {
    const data: Post[] = await getPosts();
    const highLightPosts = await getHighLightPosts();
    const categoriesData: Category[] = await getCategories(100);
    const categoriesDataFilter = categoriesData.filter(
      (category) => category.slug !== "khong-phan-loai"
    );

    // Update this object to search engine
    serverAddWordpressPage(postsPage);

    return (
      <>
        {/* Add JSON-LD to your page */}
        <div
          dangerouslySetInnerHTML={{
            __html: wpURLtoNextURL(postsPage?.seo.jsonLd.raw ?? ""),
          }}
        />
        <BlogView
          posts={data}
          highLightPosts={highLightPosts}
          categories={categoriesDataFilter}
        />
      </>
    );
  }

  // get the page data by slug
  const page: WordpressPage | null = await getPageBySlug(params.slug[0]);

  // if the page exists, render the page
  if (page && page.slug !== "booking" && page.slug !== "transactions") {
    // Update this object to search engine
    serverAddWordpressPage(page);
    if (params.slug[0] === "lich-tau") {
      return <VoyageSchedulePage page={page} />;
    }

    return <DefaultPage page={page}></DefaultPage>;
  }

  // if product page, the uri of slug is /product/{slug}
  // check if the slug is a product page
  if (params.slug.length > 1 && params.slug[0] === "product") {
    const product: Product | null = await getProduct({ slug: params.slug[1] });
    if (product) {
      const [sideBarItem, relatedProduct] = await Promise.all([
        getSideBarItem().catch(() => null),
        getProductRelatedByPost(product.slug, true).catch(
          () => [] as Product[]
        ),
      ]);

      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title,
        description:
          product.seo?.description ||
          product.excerpt?.replace(/<[^>]*>/g, "").trim() ||
          "",
        image: product.featuredImage?.node?.sourceUrl || "",
        aggregateRating:
          product.kkStarRating.count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: product.kkStarRating.avg,
                bestRating: 5,
                ratingCount: product.kkStarRating.count,
              }
            : undefined,
        offers: product.productPrice?.productPrice?.[0]
          ? {
              "@type": "Offer",
              price: product.productPrice.productPrice[0].giaHienTai,
              priceCurrency: "VND",
              availability: "https://schema.org/InStock",
            }
          : undefined,
      };

      // Update this object to search engine
      serverAddWordpressProduct(product);

      return (
        <>
          {/* Add JSON-LD to your page */}
          <div
            dangerouslySetInnerHTML={{
              __html: wpURLtoNextURL(product?.seo.jsonLd.raw ?? ""),
            }}
          />

          <script
            type="application/ld+json"
            id="kk-ratings"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <ProductDetailView
            // latestPosts={latestPosts}
            product={product}
            relatedProduct={relatedProduct}
            sideBar={sideBarItem}
          />
        </>
      );
    }
  }

  // get the post data by slug
  const post: Post | null = await getPost({ slug: params.slug[0] });

  // if the post exists, render the post
  if (post) {
    // const limit = 4;
    // const order = "DESC";
    // const latestPosts: Post[] = await getLatestPosts({ order, limit });
    const sideBar: SideBarItem | null = await getSideBarItem();
    const relatedProduct: Product[] = await getProductRelatedByPost(
      post.slug,
      false
    );

    let jsonLd = {
      "@context": "https://schema.org/",
      "@type": "CreativeWorkSeries",
      name: post.title,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: post.kkStarRating.avg,
        bestRating: 5,
        ratingCount: post.kkStarRating.count,
      },
    };

    if (post.kkStarRating.avg === 0) {
      jsonLd = {
        "@context": "https://schema.org/",
        "@type": "CreativeWorkSeries",
        name: post.title,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 5,
          bestRating: 5,
          ratingCount: 1,
        },
      };
    }

    // Update this object to search engine
    serverAddWordpressPost(post);

    return (
      <>
        {/* Add JSON-LD to your page */}
        <div
          dangerouslySetInnerHTML={{
            __html: wpURLtoNextURL(post?.seo.jsonLd.raw ?? ""),
          }}
        />

        <script
          type="application/ld+json"
          id="kk-ratings"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <PostDetailView
          // latestPosts={latestPosts}
          post={post}
          relatedProduct={relatedProduct}
          sideBar={sideBar}
        />
      </>
    );
  }

  // get the term data by uri
  const uri = `/${params.slug.join("/")}/`;
  const termNode: Term | undefined = await getTermByUri(uri);

  // skip if term not found
  if (!termNode) {
    return notFound();
  }

  // Update this object to search engine
  serverAddWordpressTerm(termNode);

  // if the term is a category, render the category page
  if (params.slug.length < 2 || termNode?.taxonomyName === "category") {
    const term: string = "category";
    const data: Post[] = await getPostsByTerm(term, uri, "DESC", 100);

    const childListCategory: Category[] = await getCategoriesBySlug(
      100,
      termNode.slug
    );

    const totalItem = (await getTotalItem(term, uri)) || 0;
    const numberPostsPerPages = Number(process.env.POSTS_PER_PAGES) || 20;
    const totalPage = Math.ceil(totalItem / numberPostsPerPages);
    let currentPage = 1;
    if (
      params.slug.length > 2 &&
      params.slug[params.slug.length - 2] === "page"
    ) {
      currentPage = Number(params.slug[params.slug.length - 1]);
    }
    const startIndex = (currentPage - 1) * numberPostsPerPages;
    const endIndex = startIndex + numberPostsPerPages;
    const paginatedPosts = data.slice(startIndex, endIndex);

    return (
      <>
        <ListView
          posts={paginatedPosts}
          totalPage={totalPage}
          currentPage={currentPage}
          title={termNode?.name}
          description={termNode?.description}
          termNode={termNode}
          categoriesData={childListCategory}
        />
      </>
    );
  } else {
    // otherwise, render other term pages
    const term = params.slug[0];
    const productData = (await getProductsByTerm(term, uri, "DESC", 100)) ?? [];
    const postData = (await getPostsByTerm(term, uri, "DESC", 100)) ?? [];
    const data: (Product | Post)[] = [...productData, ...postData];
    const totalItem = (await getTotalItem(term, uri)) || 0;
    const numberPostsPerPages = Number(process.env.POSTS_PER_PAGES) || 20;
    const totalPage = Math.ceil(totalItem / numberPostsPerPages);
    let currentPage = 1;
    if (
      params.slug.length > 2 &&
      params.slug[params.slug.length - 2] === "page"
    ) {
      currentPage = Number(params.slug[params.slug.length - 1]);
    }
    const startIndex = (currentPage - 1) * numberPostsPerPages;
    const endIndex = startIndex + numberPostsPerPages;
    const paginatedPosts = data.slice(startIndex, endIndex);

    // if the term is a tag, render the tag page
    if (term === "tag") {
      const tag = data[0]?.tags?.nodes[0];
      return (
        <ListView
          posts={paginatedPosts}
          totalPage={totalPage}
          currentPage={currentPage}
          categoriesData={[]}
          tag={tag}
          description={termNode?.description}
          termNode={termNode}
        />
      );
    }

    let defaultRouteId: string = await getRouteIdDefault();
    defaultRouteId = defaultRouteId !== "" ? defaultRouteId : "22";
    return (
      <ListWithTableView
        posts={postData}
        products={productData}
        termNode={termNode}
        routeId={Number(defaultRouteId)}
      />
    );
  }
}
