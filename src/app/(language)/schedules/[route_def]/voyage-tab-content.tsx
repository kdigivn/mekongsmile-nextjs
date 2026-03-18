"use client";

import CardVoyageWithModal from "@/components/cards/card-voyage-with-modal";
import LinkBase from "@/components/link-base";
import { Skeleton } from "@/components/ui/skeleton";
import { Voyage, VoyageItem } from "@/services/apis/voyages/types/voyage";
import { useTranslation } from "@/services/i18n/client";
import { DisableRoute } from "@/services/infrastructure/wordpress/types/sideBar";
import { Progress } from "@heroui/react";
import {
  Ref,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

export type VoyageTabContentRefType = {
  startStreaming: () => void;
  finishStreaming: () => void;
};
type Props = {
  voyages: VoyageItem[];
  selectedVoyage?: VoyageItem;
  /**
   * Display skeleton if voyages data is loading. If the voyages data are partially sent, consider using `startStreaming` & `finishStreaming` instead
   */
  isVoyageLoading?: boolean;
  isFiltering: boolean;
  debounceFilterVoyages?: (voyages: VoyageItem[]) => void | VoyageItem[];
  onVoyageCardSelect?: (voyage: VoyageItem) => void;
  isRouteEnabled?: boolean;
  disableRoute?: DisableRoute;
};
const VoyageTabContent = forwardRef(function VoyageTabContent(
  {
    voyages,
    selectedVoyage,
    isVoyageLoading,
    isFiltering,
    debounceFilterVoyages,
    onVoyageCardSelect,
    isRouteEnabled,
    disableRoute,
  }: Props,
  ref: Ref<VoyageTabContentRefType>
) {
  const { t: filterTranslation } = useTranslation("search/filter-and-sort");
  const { t: searchTranslation } = useTranslation("search");

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgressValue, setStreamingProgressValue] =
    useState<number>(0);

  // This effect handle loading progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // After init loading progress
    if (isStreaming) {
      // Handle loading progress from 0 to 90% and stuck there until finishLoading is called and set loadingProgress to 100%
      interval = setInterval(() => {
        setStreamingProgressValue((prevProgress) => {
          const randomIncrement = Math.floor(Math.random() * 10) + 1;

          return Math.min(prevProgress + randomIncrement, 90);
        });
      }, 400);
    }

    return () => {
      // clear interval when component is removed
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, [isStreaming]);

  const startStreaming = () => {
    setIsStreaming(true);
    setStreamingProgressValue(0);
  };
  const finishStreaming = () => {
    setStreamingProgressValue(100);

    setTimeout(() => {
      setIsStreaming(false);
      setStreamingProgressValue(0);
    }, 400);
  };

  useImperativeHandle(ref, () => ({
    startStreaming,
    finishStreaming,
  }));

  const cardClasses = useCallback(
    (voyage: Voyage) => ({
      base:
        selectedVoyage?.voyage.id === voyage.id ? "border border-primary" : "",
    }),
    [selectedVoyage?.voyage.id]
  );

  if (isVoyageLoading) {
    return (
      <Skeleton className="flex h-80 w-full flex-col gap-2 rounded-lg bg-neutral-200" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isStreaming && (
        <div className="flex flex-col justify-center gap-2">
          <Progress
            size="sm"
            aria-label="Loading..."
            className="w-full"
            value={streamingProgressValue ?? 0}
          />
          <div className="text-center text-sm font-semibold text-primary">
            {searchTranslation("loadingOperator", {
              value: streamingProgressValue,
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {!isRouteEnabled ? (
          disableRoute ? (
            <div className="flex w-full justify-start">
              {`Vui lòng tham khảo bài viết chi tiết: `}
              <LinkBase
                href={disableRoute?.linkPost || ""}
                className="text-info-500"
              >
                {disableRoute?.text}
              </LinkBase>{" "}
            </div>
          ) : (
            <p className="">{searchTranslation("disabled")}</p>
          )
        ) : debounceFilterVoyages && debounceFilterVoyages(voyages)?.length ? (
          // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
          debounceFilterVoyages(voyages)?.map((voyage) => (
            <CardVoyageWithModal
              key={voyage.voyage.id}
              isLoaded
              voyageItem={voyage}
              onCardPrimaryButtonPress={() => onVoyageCardSelect?.(voyage)}
              cardClasses={cardClasses(voyage.voyage)}
            />
          ))
        ) : // Filtering and not streaming and filter result empty
        isFiltering && !isStreaming ? (
          <p className="">{filterTranslation("filterResultEmpty")}</p>
        ) : (
          // When streaming data => ignore empty data
          !isStreaming && (
            <p className="">{filterTranslation("searchResultEmpty")}</p>
          )
        )}
      </div>
    </div>
  );
});

export default memo(VoyageTabContent);
