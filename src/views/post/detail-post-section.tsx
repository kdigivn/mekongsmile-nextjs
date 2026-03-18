/* eslint-disable @arthurgeron/react-usememo/require-memo */
import BoxContentWrapper from "@/components/wrapper/BoxContentWrapper";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import Image from "next/image";
import { serverGetRoutesService } from "@/services/apis/routes/routes.service";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { serverGetOperatorList } from "@/services/apis/operators/operators.service";
import { Route } from "@/services/apis/routes/types/route";
import { Operator } from "@/services/apis/operators/types/operator";
import dynamic from "next/dynamic";

import { getDisableRoutes } from "@/services/infrastructure/wordpress/queries/getBlockCustom";
import { Skeleton } from "@/components/ui/skeleton";

// Tiny SVG blur placeholder for post featured image
const POST_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCBmaWxsPSIjMWEzNjVkIiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+";

type Props = {
  post: Post;
};

const TablistVoyageTableSection = dynamic(
  () =>
    import(
      "@/components/tablist-voyage-table-section/tablist-voyage-table-section"
    ),
  {
    loading: () => (
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            <Skeleton className="h-9 w-28 rounded-md bg-neutral-200" />
            <Skeleton className="h-9 w-28 rounded-md bg-neutral-200" />
          </div>
          <Skeleton className="h-9 w-10 rounded-md bg-neutral-200" />
        </div>
        <div className="mb-3 mt-6 flex flex-col gap-2">
          {/* table header */}
          <Skeleton className="h-10 w-full rounded-md bg-neutral-200" />
          {/* table body */}
          <div className="grid w-full grid-cols-6 gap-2">
            {Array.from({ length: 60 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 rounded-lg bg-neutral-200"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const DetailPostSection = async ({ post }: Props) => {
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
  return (
    <>
      <BoxContentWrapper className="p-4">
        {post?.baivietchuyentau?.routeId && (
          <div id="voyageTable">
            <TablistVoyageTableSection
              routes={routes}
              operators={operators}
              routeId={post?.baivietchuyentau?.routeId}
              disableRoutes={disableRoutes}
            />
          </div>
        )}
        <div>
          <Image
            className="h-full w-full rounded-lg"
            src={
              post?.featuredImage?.node?.sourceUrl
                ? post?.featuredImage?.node?.sourceUrl
                : "/static-img/placeholder-image-500x500.png"
            }
            alt={
              post?.featuredImage?.node?.title
                ? post?.featuredImage?.node?.title
                : "placeholder"
            }
            width={750}
            height={422}
            unoptimized
            priority
            placeholder="blur"
            blurDataURL={POST_BLUR_PLACEHOLDER}
            sizes="(max-width: 1023px) 100vw, 750px"
          />
        </div>

        <div
          className="post-detail flex w-full flex-col p-1"
          dangerouslySetInnerHTML={{
            __html: post?.content ?? "",
          }}
        />
      </BoxContentWrapper>
    </>
  );
};

export default DetailPostSection;
