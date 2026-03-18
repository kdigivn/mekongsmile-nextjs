/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { setSeoData } from "@/lib/utils";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import {
  serverGetRouteByIdService,
  serverGetRoutesService,
} from "@/services/apis/routes/routes.service";
import { Route } from "@/services/apis/routes/types/route";
import { getServerTranslation } from "@/services/i18n";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { SchedulesQueryParams } from "../_types/route-search-params";
import SearchResult from "./page-content";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { getDisableRoutes } from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { serverGetLocationList } from "@/services/apis/locations/locations.service";

type Props = {
  params: { language: string; route_def: string };
  searchParams: { [key: string]: string | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "search");
  const routeId = +params.route_def.split("-")[0];
  const getRoute = serverGetRouteByIdService({ id: routeId });
  const { data, status } = await getRoute;

  if (status === HTTP_CODES_ENUM.OK) {
    const page: WordpressPage | null = await getEnvPage(
      PageGroupEnvKeyEnum.SCHEDULES
    );
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

    if (page) {
      if (page?.seo) {
        const metaData = setSeoData(page);
        return {
          ...metaData,
          alternates: {
            canonical: baseUrl + `/schedules/${params.route_def}/`,
          },
          title: `${metaData.title} | ${data.departure_name} - ${data.destination_name}`,
          openGraph: {
            ...metaData.openGraph,
            title: `${metaData.title} | ${data.departure_name} - ${data.destination_name}`,
            url: baseUrl + `/schedules/${params.route_def}/`,
          },
        } as Metadata;
      }
    }

    return {
      title: `${t("title")} | ${data.departure_name} - ${data.destination_name}`,
    };
  }

  return {
    title: t("title"),
  };
}

// Return a list of `params` to populate the [route_def] dynamic segment
export async function generateStaticParams() {
  try {
    const getRoutes = serverGetRoutesService();
    const { data, status } = await getRoutes();

    if (status === HTTP_CODES_ENUM.OK) {
      return data.data?.map((route) => {
        const params = [
          route.id,
          route.departure_abbreviation,
          route.destination_abbreviation,
        ];
        return {
          route_def: `${params.join("-")}`,
        };
      });
    }
  } catch {
    // API unavailable during build — pages will be generated on-demand via dynamicParams
  }

  return [];
}

export default async function Page({ params, searchParams }: Props) {
  // params format: 123-can-tho-to-vung-tau
  const routeId = +params.route_def.split("-")[0];

  // if route_id not a number
  if (isNaN(routeId)) {
    redirect(`/${params.language}`);
  }

  const queryParams: SchedulesQueryParams = {
    from: searchParams["from"] ?? "",
    to: searchParams["to"] ?? "",
    p: searchParams["p"] ?? "1",
  };

  // if no from date -> set default to next date
  if (!queryParams.from) {
    queryParams.from = format(addDays(new Date(), 1), "yyyy-MM-dd");
  }

  // get route data
  const routeData = await serverGetRouteByIdService({ id: routeId });

  const disableRoutes = await getDisableRoutes();

  // if route id not valid
  if (routeData.status !== HTTP_CODES_ENUM.OK) {
    redirect(`/${params.language}`);
  }

  const queryClient = new QueryClient();

  const routes: Route[] = [];

  const routeRequest = getRoutes();
  const locationsRequest = getLocations();

  // const prefetchDepartVoyages =
  //   serverQueryPrefetchVoyagesFindAllRelateByLocationAndDate(queryClient, {
  //     // filters: {
  //     // },
  //     departure_id: routeData.data.departure_id ?? "",
  //     destination_id: routeData.data.destination_id ?? "",
  //     departure_date: queryParams.from?.toString() ?? "",
  //     // no_remain: Number(queryParams.p) ?? 1,
  //   });

  const [routesData, locations] = await Promise.all([
    routeRequest,
    locationsRequest,
  ]);

  if (routesData?.length) {
    routes.push(...routesData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="lg:px-auto mx-auto flex min-h-[calc(100vh_-_65px)] w-full max-w-screen-xl flex-col items-center gap-4 px-5 py-4 md:px-10">
        {/* Main content */}
        <SearchResult
          numberOfPassengers={Number(queryParams.p) ?? 1}
          className="grid grid-cols-12 gap-6"
          hasReturn={!!queryParams.to}
          initFrom={queryParams.from}
          initTo={queryParams.to}
          initDepartureId={routeData.data.departure_id}
          initDestinationId={routeData.data.destination_id}
          routeSearch={routeData.data}
          routes={routes}
          disableRoutes={disableRoutes}
          locations={locations}
        />
      </div>
    </HydrationBoundary>
  );
}

const getRoutes = async () => {
  const getRoutes = serverGetRoutesService();
  const { data, status } = await getRoutes();

  if (status === HTTP_CODES_ENUM.OK) {
    return data.data;
  }
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
