/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @arthurgeron/react-usememo/require-memo */

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { serverGetOperatorList } from "@/services/apis/operators/operators.service";
import { Operator } from "@/services/apis/operators/types/operator";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import { Route } from "@/services/apis/routes/types/route";
import { getDisableRoutes } from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import ProductSummarySection from "./summary-section";

const TablistVoyageTableSection = dynamic(
  () =>
    import(
      "@/components/tablist-voyage-table-section/tablist-voyage-table-section"
    ),
  {
    loading: () => (
      <div className="mb-3 mt-6 flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
        <div className="grid w-full grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    ),
  }
);

export type ProductProps = {
  product: Product;
};

const DetailProductSection = async ({ product }: ProductProps) => {
  const getRoutes = async (): Promise<Route[]> => {
    const getRoutesCall = serverGetRoutesService();
    const { data, status } = await getRoutesCall();
    if (status === HTTP_CODES_ENUM.OK) {
      return data.data;
    }
    return [];
  };

  const getOperators = async (): Promise<Operator[]> => {
    const getOperatorsCall = serverGetOperatorList({
      filters: { is_enabled: true },
    });
    const { data, status } = await getOperatorsCall;
    if (status === HTTP_CODES_ENUM.OK) {
      return data;
    }
    return [];
  };

  const [disableRoutes, routes, operators] = await Promise.all([
    getDisableRoutes().catch(() => []),
    getRoutes().catch(() => [] as Route[]),
    getOperators().catch(() => [] as Operator[]),
  ]);

  return (
    <>
      <BoxContentWrapper>
        <ProductSummarySection product={product} />
      </BoxContentWrapper>

      <BoxContentWrapper>
        {product?.vetau?.routeid ? (
          <div id="voyageTable" style={{ minHeight: "500px" }}>
            <TablistVoyageTableSection
              routeId={product.vetau.routeid}
              disableRoutes={disableRoutes}
              operators={operators}
              routes={routes}
            />
          </div>
        ) : (
          <></>
        )}

        <div
          className="post-detail p-1"
          dangerouslySetInnerHTML={{
            __html: product?.content ?? "",
          }}
        />
      </BoxContentWrapper>
    </>
  );
};

export default DetailProductSection;
