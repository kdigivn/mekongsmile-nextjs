"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Destination, TourType, TravelStyle } from "@/graphql/types";

interface TourFilterSidebarProps {
  destinations: Destination[];
  tourTypes: TourType[];
  travelStyles: TravelStyle[];
  activeDestination?: string;
  activeTourType?: string;
  activeTravelStyles?: string[];
}

export default function TourFilterSidebar({
  destinations,
  tourTypes,
  travelStyles,
  activeDestination,
  activeTourType,
  activeTravelStyles = [],
}: TourFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleTravelStyle = useCallback(
    (slug: string) => {
      const current = activeTravelStyles.includes(slug)
        ? activeTravelStyles.filter((s) => s !== slug)
        : [...activeTravelStyles, slug];
      const params = new URLSearchParams(searchParams.toString());
      if (current.length > 0) {
        params.set("style", current.join(","));
      } else {
        params.delete("style");
      }
      router.push(`?${params.toString()}`);
    },
    [activeTravelStyles, router, searchParams]
  );

  const hasActiveFilters =
    !!activeDestination || !!activeTourType || activeTravelStyles.length > 0;

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("destination");
    params.delete("type");
    params.delete("style");
    router.push(`?${params.toString()}`);
  };

  // Only show top-level destinations (no parent)
  const topLevelDestinations = destinations.filter((d) => !d.parent);

  return (
    <aside className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      <Accordion
        type="multiple"
        defaultValue={["destination", "type", "style"]}
        className="space-y-1"
      >
        {/* Destination filter */}
        <AccordionItem value="destination" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Destination
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="dest-all"
                  checked={!activeDestination}
                  onCheckedChange={() => updateParam("destination", null)}
                />
                <Label
                  htmlFor="dest-all"
                  className="cursor-pointer text-sm font-normal"
                >
                  All destinations
                </Label>
              </div>

              {topLevelDestinations.map((dest) => (
                <div key={dest.databaseId} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`dest-${dest.slug}`}
                      checked={activeDestination === dest.slug}
                      onCheckedChange={(checked) =>
                        updateParam("destination", checked ? dest.slug : null)
                      }
                    />
                    <Label
                      htmlFor={`dest-${dest.slug}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {dest.name}
                      {dest.count ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({dest.count})
                        </span>
                      ) : null}
                    </Label>
                  </div>

                  {/* Child destinations */}
                  {dest.children?.nodes && dest.children.nodes.length > 0 && (
                    <div className="ml-5 space-y-1">
                      {dest.children.nodes.map((child) => (
                        <div
                          key={child.databaseId}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`dest-${child.slug}`}
                            checked={activeDestination === child.slug}
                            onCheckedChange={(checked) =>
                              updateParam(
                                "destination",
                                checked ? child.slug : null
                              )
                            }
                          />
                          <Label
                            htmlFor={`dest-${child.slug}`}
                            className="cursor-pointer text-sm font-normal text-muted-foreground"
                          >
                            {child.name}
                            {child.count ? (
                              <span className="ml-1 text-xs">
                                ({child.count})
                              </span>
                            ) : null}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tour Type filter */}
        <AccordionItem value="type" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Tour Type
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="type-all"
                  checked={!activeTourType}
                  onCheckedChange={() => updateParam("type", null)}
                />
                <Label
                  htmlFor="type-all"
                  className="cursor-pointer text-sm font-normal"
                >
                  All types
                </Label>
              </div>
              {tourTypes.map((type) => (
                <div key={type.databaseId} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${type.slug}`}
                    checked={activeTourType === type.slug}
                    onCheckedChange={(checked) =>
                      updateParam("type", checked ? type.slug : null)
                    }
                  />
                  <Label
                    htmlFor={`type-${type.slug}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {type.name}
                    {type.count ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({type.count})
                      </span>
                    ) : null}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Travel Style filter */}
        <AccordionItem value="style" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Travel Style
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              {travelStyles.map((style) => (
                <div key={style.databaseId} className="flex items-center gap-2">
                  <Checkbox
                    id={`style-${style.slug}`}
                    checked={activeTravelStyles.includes(style.slug)}
                    onCheckedChange={() => toggleTravelStyle(style.slug)}
                  />
                  <Label
                    htmlFor={`style-${style.slug}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {style.name}
                    {style.count ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({style.count})
                      </span>
                    ) : null}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
