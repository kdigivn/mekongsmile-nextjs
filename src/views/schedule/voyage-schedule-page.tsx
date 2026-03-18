/* eslint-disable @arthurgeron/react-usememo/require-memo */

import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import { getBreadcrumbFromSEO, wpURLtoNextURL } from "@/lib/utils";
import HeadingBase from "@/components/heading/heading-base";
import VoyagesTable from "@/components/table/homepage/voyages-table";
import { WordpressPage } from "@/services/infrastructure/wordpress/types/page";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { serverGetOperatorList } from "@/services/apis/operators/operators.service";
import { Route } from "@/services/apis/routes/types/route";
import { Operator } from "@/services/apis/operators/types/operator";
import {
  getDisableRoutes,
  getRouteIdDefault,
} from "@/services/infrastructure/wordpress/queries/getBlockCustom";

type Props = {
  page: WordpressPage;
};

const VoyageSchedulePage = async ({ page }: Props) => {
  const getRoutes = async () => {
    const getRoutes = serverGetRoutesService();
    const { data, status } = await getRoutes();

    if (status === HTTP_CODES_ENUM.OK) {
      return data.data;
    }
  };

  const disableRoutes = await getDisableRoutes();

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

  const routes: Route[] = (await getRoutes()) ?? [];
  const operators: Operator[] = (await getOperators()) ?? [];
  const defaultRouteId = await getRouteIdDefault();

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: wpURLtoNextURL(page?.seo.jsonLd.raw ?? ""),
        }}
      />
      <div className="mb-10 flex flex-col gap-4 py-3">
        <div className="lg:px-8">
          <div className="m-auto mx-5 flex max-w-7xl flex-col gap-4 md:mx-10 lg:mx-auto">
            <Breadcrumbs
              links={getBreadcrumbFromSEO(page)}
              hasBackground={false}
            />

            <HeadingBase headingTag="h1">{page.title}</HeadingBase>
            <VoyagesTable
              operators={operators}
              routes={routes}
              disableRoutes={disableRoutes}
              routeId={Number(defaultRouteId || "22")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VoyageSchedulePage;
