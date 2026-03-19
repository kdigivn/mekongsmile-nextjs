"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "popular" | "price-asc" | "price-desc" | "newest";

export default function TourSortDropdown({
  onSort,
}: {
  onSort: (sort: SortOption) => void;
}) {
  return (
    <Select defaultValue="popular" onValueChange={(v) => onSort(v as SortOption)}>
      <SelectTrigger className="w-[160px] text-xs">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">Popular</SelectItem>
        <SelectItem value="price-asc">Price: Low → High</SelectItem>
        <SelectItem value="price-desc">Price: High → Low</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
      </SelectContent>
    </Select>
  );
}
