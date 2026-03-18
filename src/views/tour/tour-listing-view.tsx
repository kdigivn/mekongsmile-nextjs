"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import type {
  TourCard,
  PageInfo,
  Destination,
  TourType,
  TravelStyle,
} from "@/graphql/types";
import TourCardComponent from "./tour-card";
import TourSearchBar from "./tour-search-bar";
import TourFilterSidebar from "./tour-filter-sidebar";
import { useDebounce } from "@/hooks/use-debounce";

type FilterOptions = {
  destinations: Destination[];
  tourTypes: TourType[];
  travelStyles: TravelStyle[];
};

type ActiveFilters = {
  destination?: string;
  type?: string;
  style?: string;
  q?: string;
};

type Props = {
  initialTours: TourCard[];
  initialPageInfo: PageInfo;
  filterOptions?: FilterOptions;
  activeFilters?: ActiveFilters;
};

export default function TourListingView({
  initialTours,
  initialPageInfo,
  filterOptions,
  activeFilters = {},
}: Props) {
  const [tours, setTours] = useState<TourCard[]>(initialTours);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState(activeFilters.q ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeTravelStyles = useMemo(
    () =>
      activeFilters.style ? activeFilters.style.split(",").filter(Boolean) : [],
    [activeFilters.style]
  );

  // Client-side text filtering on server-returned tours
  const filteredTours = useMemo(() => {
    if (!localSearch.trim()) return tours;
    const q = localSearch.toLowerCase().trim();
    return tours.filter(
      (tour) =>
        tour.name.toLowerCase().includes(q) ||
        (tour.shortDescription ?? "").toLowerCase().includes(q)
    );
  }, [tours, localSearch]);

  const [debouncedSetSearch] = useDebounce(
    useCallback((val: string) => setLocalSearch(val), []),
    300
  );

  const handleSearch = useCallback(
    (val: string) => {
      setLocalSearch(val);
      debouncedSetSearch(val);
    },
    [debouncedSetSearch]
  );

  const loadMore = async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        after: pageInfo.endCursor,
        first: "12",
      });
      if (activeFilters.destination) params.set("destination", activeFilters.destination);
      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.style) params.set("style", activeFilters.style);

      const res = await fetch(`/api/tours?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTours((prev) => [...prev, ...data.nodes]);
        setPageInfo(data.pageInfo);
      }
    } catch (e) {
      console.error("Failed to load more tours", e);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = !!filterOptions;

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar: search + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <TourSearchBar
            initialQuery={activeFilters.q ?? ""}
            onSearch={handleSearch}
          />
        </div>

        {hasFilters && (
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <div className="pt-6">
                <TourFilterSidebar
                  destinations={filterOptions!.destinations}
                  tourTypes={filterOptions!.tourTypes}
                  travelStyles={filterOptions!.travelStyles}
                  activeDestination={activeFilters.destination}
                  activeTourType={activeFilters.type}
                  activeTravelStyles={activeTravelStyles}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        {hasFilters && (
          <div className="hidden w-56 shrink-0 lg:block">
            <TourFilterSidebar
              destinations={filterOptions!.destinations}
              tourTypes={filterOptions!.tourTypes}
              travelStyles={filterOptions!.travelStyles}
              activeDestination={activeFilters.destination}
              activeTourType={activeFilters.type}
              activeTravelStyles={activeTravelStyles}
            />
          </div>
        )}

        {/* Tour grid + results */}
        <div className="flex flex-1 flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            {filteredTours.length === 0
              ? "No tours found"
              : `${filteredTours.length} tour${filteredTours.length !== 1 ? "s" : ""} found`}
            {localSearch && (
              <span>
                {" "}
                for &ldquo;<strong>{localSearch}</strong>&rdquo;
              </span>
            )}
          </p>

          {filteredTours.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTours.map((tour) => (
                  <TourCardComponent key={tour.databaseId} tour={tour} />
                ))}
              </div>

              {pageInfo.hasNextPage && !localSearch.trim() && (
                <div className="flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? "Loading..." : "Load More Tours"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">
                No tours match your current filters.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "?")}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
