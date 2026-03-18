import Link from "@/components/link-base";
import type { Destination } from "@/graphql/types";

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
  if (topLevel.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold">Popular Destinations</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {topLevel.map((dest, i) => (
          <Link
            key={dest.slug}
            href={`/destination/${dest.slug}/`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} transition-all duration-300 group-hover:scale-105`}
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
    </section>
  );
}
