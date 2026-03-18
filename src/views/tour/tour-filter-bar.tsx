"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  name: string;
  slug: string;
  count: number | null;
}

interface TourFilterBarProps {
  destinations: FilterOption[];
  tourTypes: FilterOption[];
  travelStyles: FilterOption[];
}

export default function TourFilterBar({
  destinations,
  tourTypes,
  travelStyles,
}: TourFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDestination = searchParams.get("destination") ?? "";
  const currentType = searchParams.get("type") ?? "";
  const currentStyle = searchParams.get("style") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("after");
      router.push(`/tours/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/tours/");
  }, [router]);

  const hasFilters = currentDestination || currentType || currentStyle;

  const selectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <select
        value={currentDestination}
        onChange={(e) => updateFilter("destination", e.target.value)}
        className={selectClass}
        aria-label="Filter by destination"
      >
        <option value="">All Destinations</option>
        {destinations.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.name}
            {d.count ? ` (${d.count})` : ""}
          </option>
        ))}
      </select>

      <select
        value={currentType}
        onChange={(e) => updateFilter("type", e.target.value)}
        className={selectClass}
        aria-label="Filter by tour type"
      >
        <option value="">All Tour Types</option>
        {tourTypes.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
            {t.count ? ` (${t.count})` : ""}
          </option>
        ))}
      </select>

      <select
        value={currentStyle}
        onChange={(e) => updateFilter("style", e.target.value)}
        className={selectClass}
        aria-label="Filter by travel style"
      >
        <option value="">All Travel Styles</option>
        {travelStyles.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
            {s.count ? ` (${s.count})` : ""}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
