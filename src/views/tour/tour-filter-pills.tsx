"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type Props = {
  activeDestination?: string;
  activeTourType?: string;
  activeTravelStyles: string[];
};

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
      {label}
      <button onClick={onRemove} className="hover:text-red-500">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function TourFilterPills({
  activeDestination,
  activeTourType,
  activeTravelStyles,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/tours/?${params.toString()}`);
  };

  const clearAll = () => router.push("/tours/");

  const hasFilters =
    activeDestination || activeTourType || activeTravelStyles.length > 0;
  if (!hasFilters) return null;

  return (
    <div className="sticky top-[60px] z-30 -mx-4 bg-pageBackground/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-x-auto">
        {activeDestination && (
          <FilterPill
            label={activeDestination}
            onRemove={() => removeFilter("destination")}
          />
        )}
        {activeTourType && (
          <FilterPill
            label={activeTourType}
            onRemove={() => removeFilter("type")}
          />
        )}
        {activeTravelStyles.map((s) => (
          <FilterPill
            key={s}
            label={s}
            onRemove={() => removeFilter("style")}
          />
        ))}
        <button
          onClick={clearAll}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
