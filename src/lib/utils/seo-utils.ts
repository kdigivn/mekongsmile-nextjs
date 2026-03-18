/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreadcrumbsLinkProps } from "@/components/breadcrumbs/breadcrumbs";
import {
  WordpressPage,
  WordpressPageShortForSlug,
} from "@/services/infrastructure/wordpress/types/page";
import { FaqItem } from "@/services/infrastructure/wordpress/types/sideBar";

export const wpURLtoNextURL = (str: string) => {
  let cmsSite = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (cmsSite) {
    const indexOfGraphql = cmsSite.indexOf("/graphql");
    cmsSite =
      indexOfGraphql !== -1 ? cmsSite.substring(0, indexOfGraphql) : cmsSite;
  }
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const replaceString = str.replace(
    new RegExp(cmsSite ?? "", "g"),
    siteUrl ?? ""
  );

  return replaceString.replace(
    new RegExp(`${siteUrl}/wp-content/`, "g"),
    `${cmsSite}/wp-content/`
  );
};

export const getUriFromWpURL = (str: string) => {
  let cmsSite = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  let site = cmsSite;
  if (cmsSite) {
    const indexOfGraphql = cmsSite.indexOf("/graphql");
    cmsSite =
      indexOfGraphql !== -1 ? cmsSite.substring(0, indexOfGraphql) : cmsSite;
    site = cmsSite.replace("cms.", "");
  }
  return str
    ?.replace(new RegExp(cmsSite ?? "", "g"), "")
    ?.replace(new RegExp(site ?? "", "g"), "");
};

export const setSeoData = ({ seo }: { seo: WordpressPage["seo"] }) => {
  if (!seo) return {};

  seo = JSON.parse(wpURLtoNextURL(JSON.stringify(seo)));

  return {
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}`),
    title: seo.title || "",
    description: seo.description || "",
    robots: {
      index: seo.robots.includes("index"),
      follow: seo.robots.includes("follow"),
    },
    openGraph: {
      title: seo.openGraph.title || "",
      description: seo.openGraph.description || "",
      url: seo.openGraph.url || "",
      siteName: seo.openGraph.siteName || "",
      images: [seo.openGraph?.image || ""],
      locale: seo.openGraph.locale || "vi_VN",
      type:
        (seo.openGraph.type as
          | "website"
          | "article"
          | "book"
          | "profile"
          | "music.song"
          | "music.album"
          | "music.playlist"
          | "music.radio_station"
          | "video.movie"
          | "video.episode"
          | "video.tv_show"
          | "video.other"
          | undefined) || "website",
    },
    twitter: {
      card:
        (seo.openGraph.twitterMeta.card as
          | "summary_large_image"
          | "summary"
          | "player"
          | "app"
          | undefined) || "summary_large_image",
      title: seo.openGraph.twitterMeta.title || "",
      description: seo.openGraph.twitterMeta.description || "",
      images: [seo.openGraph.twitterMeta.image || ""],
    },
    keywords: seo.focusKeywords || [""],
  };
};

export const getBreadcrumbFromSEO = ({
  seo,
}: {
  seo?: WordpressPage["seo"];
}): BreadcrumbsLinkProps[] => {
  if (!seo) return [];

  seo.breadcrumbs = seo.breadcrumbs.filter(
    (breadcrumb) => !breadcrumb.isHidden && breadcrumb.url !== ""
  );

  seo.breadcrumbs = seo.breadcrumbs.map((breadcrumb) => ({
    ...breadcrumb,
    url: `${getUriFromWpURL(breadcrumb.url).startsWith("/") ? "" : "/"}${getUriFromWpURL(breadcrumb.url)}`,
  }));

  const links: BreadcrumbsLinkProps[] = seo.breadcrumbs.map((breadcrumb) => ({
    href: breadcrumb.url,
    name: breadcrumb.text,
  }));
  if (
    seo.breadcrumbTitle &&
    seo.breadcrumbTitle !== links[links.length - 1].name
  )
    links.push({ name: seo.breadcrumbTitle, href: "" });
  return links;
};

export type FAQSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
};

export const getFAQSchema = (faqItems: FaqItem[]): FAQSchema => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems?.map((item) => ({
      "@type": "Question",
      name: item.faqKey,
      acceptedAnswer: { "@type": "Answer", text: item.faqValue || "" },
    })),
  };
};

export const excludeNextJsPage = (
  pages: WordpressPageShortForSlug[]
): WordpressPageShortForSlug[] => {
  const excludeUri = [
    "/booking/",
    "/confirm-email/",
    "/forgot-password/",
    "/password-change/",
    "/profile/",
    "/schedules/",
    "/sign-in/",
    "/sign-up/",
    "/ticket-detail/",
    "/user-bookings/",
  ];

  return pages.filter((page) => !excludeUri.includes(page.uri));
};
