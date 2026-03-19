export default function TrustBar() {
  return (
    <div className="border-y border-gray-100 bg-white py-4">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-8 px-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="text-amber-500">★★★★★</span>
          <span className="font-semibold">500+ Reviews</span>
        </span>
        <span className="hidden h-4 w-px bg-gray-300 sm:block" />
        <span className="font-semibold">Top Rated on TripAdvisor</span>
        <span className="hidden h-4 w-px bg-gray-300 sm:block" />
        <span className="font-semibold">Trusted since 2017</span>
      </div>
    </div>
  );
}
