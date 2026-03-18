/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";
import TicketDetail from "./page-content";
import { TicketDetailParams } from "@/services/apis/tickets/types/ticket-detail-params";
import { serverGetVoyageService } from "@/services/apis/voyages/voyages.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { notFound, redirect } from "next/navigation";
import { BoatLayout } from "@/services/apis/boatLayouts/types/boat-layout";
import { serverGetBoatLayoutFromDatabaseOfVoyageService } from "@/services/apis/boatLayouts/boatlayout.service";
import { OperatorNationality } from "@/services/apis/operators/types/operator-nationality";
import {
  serverGetOperatorList,
  serverGetOperatorNationality,
} from "@/services/apis/operators/operators.service";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { setSeoData, wpURLtoNextURL } from "@/lib/utils";
import { PageGroupEnvKeyEnum } from "@/services/infrastructure/wordpress/enums/page-group-env-key-enum";
import { getEnvPage } from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import { getDisableRoutes } from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { getHangs } from "@/services/infrastructure/wordpress/queries/getHangs";
import { syncOperatorNationality } from "@/services/apis/operators/utils";
import {
  isClickbaitVoyageId,
  getRootVoyageId,
  CLICKBAIT_CONFIGS,
} from "@/lib/clickBaitUtil";

type Props = {
  params: { language: string };
  searchParams: { [key: string]: string | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.TICKET_DETAIL
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const { t } = await getServerTranslation(params.language, "ticket-detail");

  if (page) {
    if (page?.seo) {
      const metaData = setSeoData(page);
      return {
        ...metaData,
        alternates: {
          canonical: baseUrl + "/" + page.slug,
        },
      } as Metadata;
    }

    return {
      // title,
      title: page?.seo.title,
      description: page?.seo.description,
      alternates: {
        canonical: baseUrl + "/" + page.slug,
      },
    } as Metadata;
  }

  return {
    title: t("title"),
  };
}

export default async function Page({ searchParams, params }: Props) {
  const page: WordpressPage | null = await getEnvPage(
    PageGroupEnvKeyEnum.TICKET_DETAIL
  );

  const getOperators = async () => {
    const getOperators = serverGetOperatorList({
      filters: {
        is_enabled: true,
      },
    });
    const { data, status } = await getOperators;

    if (status === HTTP_CODES_ENUM.OK) {
      return data;
    }
  };

  const getRoutes = async () => {
    const getServerRoutes = serverGetRoutesService();
    const { data, status } = await getServerRoutes();

    if (status === HTTP_CODES_ENUM.OK) {
      return data.data;
    }
  };
  const [operators, routes, hangs] = await Promise.all([
    getOperators(),
    getRoutes(),
    getHangs(),
  ]);

  const queryParams: TicketDetailParams = {
    departVoyageId: searchParams["departVoyageId"] ?? "",
    returnVoyageId: searchParams["returnVoyageId"] ?? "",
  };
  if (searchParams["numberOfPassengers"]) {
    queryParams.numberOfPassengers = parseInt(
      searchParams["numberOfPassengers"]
    );
  }
  const { t } = await getServerTranslation(params.language, "ticket-detail");

  if (
    !queryParams.departVoyageId ||
    !queryParams.numberOfPassengers ||
    queryParams.numberOfPassengers <= 0
  ) {
    redirect(`/${params.language}`);
  }

  // Parse clickbait voyage ID (remove -CB suffix to get root voyage ID)
  const isDepartClickbait = isClickbaitVoyageId(queryParams.departVoyageId);
  const isReturnClickbait = queryParams.returnVoyageId
    ? isClickbaitVoyageId(queryParams.returnVoyageId)
    : false;

  const actualDepartVoyageId = isDepartClickbait
    ? getRootVoyageId(queryParams.departVoyageId)
    : queryParams.departVoyageId;

  const actualReturnVoyageId = queryParams.returnVoyageId
    ? isReturnClickbait
      ? getRootVoyageId(queryParams.returnVoyageId)
      : queryParams.returnVoyageId
    : undefined;

  const departVoyageRes = await serverGetVoyageService({
    id: actualDepartVoyageId,
  });

  if (departVoyageRes.status === HTTP_CODES_ENUM.OK) {
    // Add clickBait data to voyage if this is a clickbait voyage
    let departVoyage = departVoyageRes.data;
    if (isDepartClickbait) {
      const config = CLICKBAIT_CONFIGS.find(
        (c) =>
          c.routeId === departVoyage.route_id &&
          c.departureDates.includes(departVoyage.departure_date)
      );
      const promoPrice = config?.promoPrice ?? 0;

      departVoyage = {
        ...departVoyage,
        clickBait: {
          price: promoPrice,
          rootVoyageId: actualDepartVoyageId,
        },
      };
    }

    const voyage: {
      departVoyage: Voyage;
      destiVoyage?: Voyage;
    } = { departVoyage };

    const fetchBoatLayoutFromDatabase: {
      departBoatLayout?: BoatLayout;
      destiBoatLayout?: BoatLayout;
    } = {};

    let departOperatorNationalities: OperatorNationality[] = [];
    let destiOperatorNationalities: OperatorNationality[] = [];

    const departBoatLayoutRes =
      await serverGetBoatLayoutFromDatabaseOfVoyageService({
        voyageId: actualDepartVoyageId,
      });

    if (departBoatLayoutRes.status === HTTP_CODES_ENUM.OK) {
      // Override prices with clickbait pricing if applicable
      const boatLayout = isDepartClickbait
        ? {
            ...departBoatLayoutRes.data.boatLayout,
            prices: departBoatLayoutRes.data.boatLayout.prices.map((price) => ({
              ...price,
              price_with_VAT: voyage.departVoyage.clickBait!.price,
            })),
          }
        : departBoatLayoutRes.data.boatLayout;

      fetchBoatLayoutFromDatabase.departBoatLayout = boatLayout;
    }

    const departOperatorNationalitiesRes = await serverGetOperatorNationality({
      id: voyage.departVoyage.operator_id,
    });

    if (departOperatorNationalitiesRes.status === HTTP_CODES_ENUM.OK) {
      departOperatorNationalities = departOperatorNationalitiesRes.data;
    }
    if (actualReturnVoyageId) {
      const returnVoyageRes = await serverGetVoyageService({
        id: actualReturnVoyageId,
      });

      if (returnVoyageRes.status === HTTP_CODES_ENUM.OK) {
        // Add clickBait data to voyage if this is a clickbait voyage
        let destiVoyage = returnVoyageRes.data;
        if (isReturnClickbait) {
          const config = CLICKBAIT_CONFIGS.find(
            (c) =>
              c.routeId === destiVoyage.route_id &&
              c.departureDates.includes(destiVoyage.departure_date)
          );
          const promoPrice = config?.promoPrice ?? 0;

          destiVoyage = {
            ...destiVoyage,
            clickBait: {
              price: promoPrice,
              rootVoyageId: actualReturnVoyageId,
            },
          };
        }

        voyage.destiVoyage = destiVoyage;
      }

      const destiBoatLayoutRes =
        await serverGetBoatLayoutFromDatabaseOfVoyageService({
          voyageId: actualReturnVoyageId,
        });

      if (destiBoatLayoutRes.status === HTTP_CODES_ENUM.OK) {
        // Override prices with clickbait pricing if applicable
        const boatLayout = isReturnClickbait
          ? {
              ...destiBoatLayoutRes.data.boatLayout,
              prices: destiBoatLayoutRes.data.boatLayout.prices.map(
                (price) => ({
                  ...price,
                  price_with_VAT: voyage.destiVoyage!.clickBait!.price,
                })
              ),
            }
          : destiBoatLayoutRes.data.boatLayout;

        fetchBoatLayoutFromDatabase.destiBoatLayout = boatLayout;
      }

      // if depart and return trip has the same operator => do not need to fetch nationalities again
      if (voyage.destiVoyage?.operator_id === voyage.departVoyage.operator_id) {
        destiOperatorNationalities = departOperatorNationalities;
      } else {
        const destiOperatorNationalitiesRes =
          await serverGetOperatorNationality({
            id: voyage.destiVoyage ? voyage.destiVoyage.operator_id : "",
          });

        if (destiOperatorNationalitiesRes.status === HTTP_CODES_ENUM.OK) {
          destiOperatorNationalities = destiOperatorNationalitiesRes.data;
        }
      }
    }

    let isValid = true;
    let invalidMessage = "";

    if (voyage.departVoyage.disable) {
      isValid = false;
      invalidMessage = t("voyage-invalid.departCancel");
    }
    const today = new Date();
    const departureDateTime = new Date(
      `${voyage.departVoyage.departure_date}T${voyage.departVoyage.depart_time}`
    );
    if (today > departureDateTime) {
      isValid = false;
      invalidMessage = t("voyage-invalid.voyageDepart");
    }
    if (voyage.departVoyage.no_remain < queryParams.numberOfPassengers) {
      isValid = false;
      invalidMessage = t("voyage-invalid.notEnoughSeat");
    }

    if (voyage.destiVoyage) {
      if (voyage.destiVoyage.disable) {
        isValid = false;
        invalidMessage = t("voyage-invalid.returnCancel");
      }
      const returnDateTime = new Date(
        `${voyage.destiVoyage.departure_date}T${voyage.destiVoyage.depart_time}`
      );
      if (today > returnDateTime) {
        isValid = false;
        invalidMessage = t("voyage-invalid.voyageDepart");
      }
      if (voyage.destiVoyage.no_remain < queryParams.numberOfPassengers) {
        isValid = false;
        invalidMessage = t("voyage-invalid.notEnoughReturnSeat");
      }
      if (voyage.destiVoyage.id === voyage.departVoyage.id) {
        isValid = false;
        invalidMessage = t("voyage-invalid.sameVoyage");
      }
    }

    const disableRoutes = await getDisableRoutes();

    let returnOperatorNationalitiesSync = destiOperatorNationalities;

    if (returnOperatorNationalitiesSync) {
      returnOperatorNationalitiesSync = syncOperatorNationality(
        departOperatorNationalities,
        destiOperatorNationalities ?? []
      );
    }

    return (
      <>
        <div
          dangerouslySetInnerHTML={{
            __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
          }}
        />
        <TicketDetail
          selectedVoyages={voyage}
          numberOfPassengers={queryParams.numberOfPassengers}
          boatLayout={fetchBoatLayoutFromDatabase}
          departOperatorNationalities={departOperatorNationalities}
          destiNationalities={returnOperatorNationalitiesSync}
          isValid={isValid}
          invalidMessage={invalidMessage}
          operators={operators ?? []}
          routes={routes ? routes : []}
          disableRoutes={disableRoutes}
          hangs={hangs}
          isDepartClickbait={isDepartClickbait}
          isReturnClickbait={isReturnClickbait}
        />
      </>
    );
  }

  return notFound();
}
