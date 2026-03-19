"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface TourSearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

export default function TourSearchBar({
  initialQuery = "",
  onSearch,
}: TourSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(initialQuery);

  const [debouncedUpdate] = useDebounce(
    useCallback(
      (value: string) => {
        if (onSearch) {
          onSearch(value);
          return;
        }
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        router.push(`?${params.toString()}`);
      },
      [onSearch, router, searchParams]
    ),
    300
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedUpdate(val);
  };

  const handleClear = () => {
    setInputValue("");
    debouncedUpdate("");
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search tours..."
        value={inputValue}
        onChange={handleChange}
        className="pl-9 pr-9"
        aria-label="Search tours"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
