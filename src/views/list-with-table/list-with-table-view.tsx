/* eslint-disable @arthurgeron/react-usememo/require-memo */

import Breadcrumbs from "@/components/breadcrumbs/breadcrumbs";
import HeadingBase from "@/components/heading/heading-base";
import ListWithLoadMore from "@/components/list-with-load-more";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { TablistVoyageTableProps } from "@/components/tablist-voyage-table-section/tablist-voyage-table-section";
import {
  cn,
  fixFormatDescription,
  getBreadcrumbFromSEO,
  toCamelCase,
} from "@/lib/utils";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { serverGetLocationList } from "@/services/apis/locations/locations.service";
import { serverGetOperatorList } from "@/services/apis/operators/operators.service";
import { Operator } from "@/services/apis/operators/types/operator";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import { Route } from "@/services/apis/routes/types/route";
import { getDisableRoutes } from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { Term } from "@/services/infrastructure/wordpress/types/term";
import { TypeOfProductEnum } from "@/services/infrastructure/wordpress/types/type-of-product.enum";

const TablistVoyageTableSection = dynamic(
  () =>
    import(
      "@/components/tablist-voyage-table-section/tablist-voyage-table-section"
    ),
  {
    loading: () => (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
        <Skeleton className="h-40 w-full rounded-md bg-neutral-200" />
      </div>
    ),
  }
);

type Props = {
  termNode: Term;
  products: Product[];
  posts: Post[];
  routeId: number;
};

const ListWithTableView = async ({
  termNode,
  products,
  posts,
  routeId,
}: Props) => {
  const links = getBreadcrumbFromSEO(termNode!) ?? [];
  const termName = toCamelCase(termNode?.taxonomyName);
  const operatorsResponse = await serverGetOperatorList({
    filters: {
      is_enabled: true,
    },
  });
  const locationsResponse = await serverGetLocationList();
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

  const voyageTableProps: TablistVoyageTableProps = {
    routes,
    operators: operators,
    routeId,
  };

  if (termName === "hang" && operatorsResponse.status === 200) {
    const operators = operatorsResponse.data;
    const operatorId = operators.find(
      (operator) => operator.operator_code === termNode.operatorInfo?.operatorId
    )?.id;
    if (operatorId) {
      voyageTableProps.operatorId = operatorId;
      if (termNode.operatorInfo?.routeId) {
        voyageTableProps.routeId = Number.parseInt(
          termNode.operatorInfo?.routeId,
          10
        );
      }
    }
  }

  if (
    (termName === "khoiHanhTu" || termName === "khoi_hanh_tu") &&
    locationsResponse.status === 200
  ) {
    const locations = locationsResponse.data;
    const locationAbbr = locations.find(
      (location) => location.abbreviation === termNode.locationInfo?.locationId
    )?.abbreviation;
    if (locationAbbr) voyageTableProps.departureSlug = locationAbbr;
  }

  if (
    (termName === "diemDen" || termName === "diem_den") &&
    locationsResponse.status === 200
  ) {
    const locations = locationsResponse.data;
    if (termNode.locationInfo?.locationId) {
      const locationAbbr = locations.find(
        (location) =>
          location.abbreviation === termNode.locationInfo?.locationId
      )?.abbreviation;
      if (locationAbbr) voyageTableProps.destinationSlug = locationAbbr;
    } else {
      const slug = termNode.uri.split("/")[2]; // slug [ '', 'diem-den', 'con-dao', 'cang-ben-dam', '' ]
      if (slug) voyageTableProps.destinationSlug = slug;
    }
  }

  if (termName === "productCategory") {
    const typeOfProduct = termNode.setting?.typeOfProduct;
    if (
      typeOfProduct &&
      typeOfProduct.length > 0 &&
      !typeOfProduct.includes(TypeOfProductEnum.ferryTicket)
    ) {
      voyageTableProps.hidden = true;
    }
  }

  return (
    <div className="mb-10 flex flex-col gap-4 pb-3">
      <div className="lg:px-8">
        <div className="m-auto mx-5 flex max-w-7xl flex-col gap-6 px-3 md:mx-10 lg:mx-auto">
          <Breadcrumbs links={links} hasBackground={false} />
        </div>
        <div className="m-auto mx-5 flex max-w-7xl flex-col gap-6 px-3 md:mx-10 lg:mx-auto">
          <HeadingBase headingTag="h1">{termNode.name}</HeadingBase>

          <div style={{ minHeight: "500px" }}>
            <TablistVoyageTableSection
              {...voyageTableProps}
              disableRoutes={disableRoutes}
            />
          </div>

          <div
            className={(cn(!termNode?.description && "hidden"), "post-detail")}
            dangerouslySetInnerHTML={{
              __html: fixFormatDescription(termNode?.description ?? ""),
            }}
          />

          {/* Products Section */}
          {products.length > 0 && (
            <ListWithLoadMore
              items={products}
              title={`Các dịch vụ ${termNode.name}`}
              type="product"
            />
          )}

          {/* Posts Section */}
          {posts.length > 0 && (
            <ListWithLoadMore
              items={posts}
              title={`Các bài viết ${termNode.name}`}
              type="post"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListWithTableView;
