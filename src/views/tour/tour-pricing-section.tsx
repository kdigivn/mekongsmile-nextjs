import type { ShortTourInformation } from "@/graphql/types";

type Props = {
  info: ShortTourInformation;
  tourName: string;
};

export default function TourPricingSection({ info, tourName }: Props) {
  const { priceInUsd, priceInVnd, duration, language, bestTimeToVisit } = info;

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      {priceInUsd && (
        <p className="mb-1 text-2xl font-bold text-primary">
          From ${priceInUsd} USD
          {priceInVnd && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({priceInVnd.toLocaleString("vi-VN")} VND)
            </span>
          )}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2 text-sm">
        {duration && (
          <div className="flex gap-2">
            <span className="w-32 font-medium text-muted-foreground">
              Duration:
            </span>
            <span>{duration}</span>
          </div>
        )}
        {language && (
          <div className="flex gap-2">
            <span className="w-32 font-medium text-muted-foreground">
              Language:
            </span>
            <span>{language}</span>
          </div>
        )}
        {bestTimeToVisit && (
          <div className="flex gap-2">
            <span className="w-32 font-medium text-muted-foreground">
              Best time:
            </span>
            <span>{bestTimeToVisit}</span>
          </div>
        )}
      </div>

      <a
        href={`mailto:info@mekongsmile.com?subject=Booking inquiry: ${encodeURIComponent(tourName)}`}
        className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Book This Tour
      </a>
    </div>
  );
}
