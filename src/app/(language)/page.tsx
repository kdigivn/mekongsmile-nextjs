/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */
import LayoutWrapper from "@/components/wrapper/layout-wrapper";
import { setSeoData } from "@/lib/utils";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { serverGetOperatorList } from "@/services/apis/operators/operators.service";
import { getServerTranslation } from "@/services/i18n";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import {
  getAllOperators,
  getDisableRoutes,
  getHighlightRoutes,
  getHomePageHeroTitle,
  getHomePageHighLightItems,
  getHomePageSliderItems,
  getRouteIdDefault,
} from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { getHangs } from "@/services/infrastructure/wordpress/queries/getHangs";
import {
  getAdvertisingPosts,
  getPosts,
} from "@/services/infrastructure/wordpress/queries/getPosts";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import HeroSection from "@/views/homepage/hero-section";
import MainLayoutSection from "@/views/homepage/view/main-layout-section";
import type { Metadata } from "next";
import Image from "next/image";
import Home from "./page-content";
import blogBackground from "../../../public/static-img/blog-background.jpg";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import { HighlightRouteMain } from "@/services/infrastructure/wordpress/types/sideBar";
import { Route } from "@/services/apis/routes/types/route";
import { getFeaturedProducts } from "@/services/infrastructure/wordpress/queries/getProduct";
import { serverGetLocationList } from "@/services/apis/locations/locations.service";

// Revalidate homepage CMS data every 5 minutes. Voyage table fetches client-side (staleTime: 0).
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const frontPage: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.FRONT_PAGE
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (frontPage) {
    if (frontPage?.seo) {
      const metaData = setSeoData(frontPage);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/",
        },
      } as Metadata;
    }

    return {
      // title,
      title: frontPage?.seo.title,
      description: frontPage?.seo.description,
      alternates: {
        canonical: baseUrl + "/",
      },
    } as Metadata;
  }
  const { t } = await getServerTranslation("vi", "home");
  return {
    title: t("title"),
  };
}

export default async function Page() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const { t } = useTranslation("home");

  const getOperators = async () => {
    const getOperators = serverGetOperatorList({
      filters: {
        is_enabled: true,
      },
    });
    const { data, status } = await getOperators;

    if (status === HTTP_CODES_ENUM.OK) {
      return data;
    } else {
      return [];
    }
  };

  const getRoutes = async () => {
    const getServerRoutes = serverGetRoutesService();
    const { data, status } = await getServerRoutes();

    if (status === HTTP_CODES_ENUM.OK) {
      return data.data;
    }
    return [];
  };

  const getLocations = async () => {
    const getServerLocations = serverGetLocationList();
    const { data, status } = await getServerLocations;

    if (status === HTTP_CODES_ENUM.OK) {
      return data;
    } else {
      return [];
    }
  };

  const order = "DESC";
  const limit = 12;
  const [
    homeHeroTitle,
    homeHighLight,
    posts,
    advertisingPosts,
    travelGuidePosts,
    hangs,
    operatorImgs,
    heroSlider,
    highlightRoutes,
    routeIdDefault,
    operators,
    routes,
    products,
    disableRoutes,
    locations,
  ] = await Promise.all([
    getHomePageHeroTitle(),
    getHomePageHighLightItems(),
    getPosts(order, limit),
    getAdvertisingPosts(),
    getPosts(
      order,
      limit,
      "",
      process.env.NEXT_PUBLIC_TRAVEL_GUIDE_CATEGORY ?? ""
    ),
    getHangs(),
    getAllOperators(),
    getHomePageSliderItems(),
    getHighlightRoutes(),
    getRouteIdDefault(),
    getOperators(),
    getRoutes(),
    getFeaturedProducts(),
    getDisableRoutes(),
    getLocations(),
  ]);

  // // FInally we fetch route data
  // const routes: Route[] = (await getRoutes()) ?? [];

  // handle filter highlightRoute and Route
  const matchedRoutes: HighlightRouteMain[] = highlightRoutes
    .map((highlightRoute) => {
      // Tìm route tương ứng trong mảng routes
      const matchedRoute = routes?.find(
        (route) => route.id === Number(highlightRoute.routeId)
      );
      // Nếu tìm thấy route tương ứng, trả về object với thông tin mong muốn
      if (matchedRoute) {
        const departure = locations?.find(
          (location) => location.id === matchedRoute.departure_id
        );
        const destination = locations?.find(
          (location) => location.id === matchedRoute.destination_id
        );

        return {
          selectedDeparture: departure,
          selectedDestination: destination,
          departure_name: highlightRoute.departure_name,
          destination_name: highlightRoute.destination_name,
          departure_abbreviation: matchedRoute.departure_abbreviation,
          destination_abbreviation: matchedRoute.destination_abbreviation,
          routeId: highlightRoute.routeId,
        };
      }

      // Nếu không tìm thấy, trả về null
      return [];
    })
    .filter(Boolean) as HighlightRouteMain[]; // Loại bỏ các phần tử null

  const routeDefault: Route | undefined = routes?.find(
    (route) => route.id === Number(routeIdDefault)
  );

  return (
    <>
      <div className="relative flex h-[698px] w-full flex-col items-center justify-center sm:h-[836px] md:h-[777px] md:p-10 lg:h-[500px] lg:p-0">
        {/* Background image */}
        <div className="z-1 absolute inset-0">
          <Image
            src={blogBackground}
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover"
            quality={75}
            priority={true}
            placeholder="blur"
          />
        </div>
        <div className="z-[2] flex w-full max-w-7xl items-center justify-center overflow-hidden lg:overflow-auto">
          <HeroSection
            routes={routes ?? []}
            heroTitle={homeHeroTitle}
            heroSlider={heroSlider}
            highlightRouteMain={matchedRoutes}
            routeDefault={routeDefault}
          />
        </div>
      </div>
      <LayoutWrapper>
        <Home
          homeHighLight={homeHighLight}
          routes={routes ?? []}
          operators={operators ?? []}
          disableRoutes={disableRoutes}
          routeId={Number(routeIdDefault)}
        />
      </LayoutWrapper>

      <MainLayoutSection
        advertisingPosts={advertisingPosts}
        travelGuidePosts={travelGuidePosts}
        hangs={hangs}
        posts={posts}
        products={products}
        isHiddenProducts={products.length === 0}
        operatorImgs={operatorImgs}
      />
    </>
  );
}
