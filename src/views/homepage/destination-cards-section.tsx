"use client";

import { useState } from "react";
import Link from "@/components/link-base";
import type { Destination } from "@/graphql/types";
import SectionHeading from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const GRADIENT_COLORS = [
  "from-emerald-700 to-teal-600",
  "from-blue-700 to-cyan-600",
  "from-amber-700 to-orange-600",
  "from-violet-700 to-purple-600",
  "from-rose-700 to-pink-600",
  "from-slate-700 to-gray-600",
];

export default function DestinationCardsSection({
  destinations,
}: {
  destinations: Destination[];
}) {
  const topLevel = destinations.filter((d) => !d.parent);
  const [activeTab, setActiveTab] = useState<string>("all");

  if (topLevel.length === 0) return null;

  const filteredDestinations =
    activeTab === "all"
      ? topLevel
      : topLevel.filter((d) => d.slug === activeTab);

  if (filteredDestinations.length === 0) {
    setActiveTab("all");
    return null;
  }

  const [first, ...rest] = filteredDestinations;

  return (
    <section className="section-spacing bg-brand-sage-light">
      <SectionHeading
        chip="Destinations"
        title="Discover Iconic Places"
        emphasisWord="Iconic Places"
        centered
      />

      {/* Tab pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "all"
              ? "bg-primary text-white"
              : "bg-white text-muted-foreground hover:bg-gray-100"
          )}
        >
          All
        </button>
        {topLevel.map((dest) => (
          <button
            key={dest.slug}
            onClick={() => setActiveTab(dest.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === dest.slug
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:bg-gray-100"
            )}
          >
            {dest.name}
          </button>
        ))}
      </div>

      {/* Single destination — full-width card */}
      {filteredDestinations.length === 1 ? (
        <Link
          href={`/destination/${first.slug}/`}
          className="group relative block aspect-[16/6] overflow-hidden rounded-2xl"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[0]} transition-all duration-300 group-hover:scale-105`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="font-heading text-3xl font-bold">{first.name}</h3>
            {first.count !== null && first.count > 0 && (
              <p className="text-sm text-white/80">{first.count} tours</p>
            )}
          </div>
        </Link>
      ) : (
        /* Bento grid — all destinations */
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href={`/destination/${first.slug}/`}
            className="group relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto md:min-h-[320px]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[0]} transition-all duration-300 group-hover:scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-heading text-2xl font-bold">{first.name}</h3>
              {first.count !== null && first.count > 0 && (
                <p className="text-sm text-white/80">{first.count} tours</p>
              )}
            </div>
          </Link>

          {rest.map((dest, i) => (
            <Link
              key={dest.slug}
              href={`/destination/${dest.slug}/`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[(i + 1) % GRADIENT_COLORS.length]} transition-all duration-300 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">{dest.name}</h3>
                {dest.count !== null && dest.count > 0 && (
                  <p className="text-sm text-white/80">{dest.count} tours</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
