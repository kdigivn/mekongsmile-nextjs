import { Check } from "lucide-react";
import type { ShortTourInformation } from "@/graphql/types";

type Props = {
  info: ShortTourInformation;
  tourName: string;
};

export default function TourPricingSection({ info, tourName }: Props) {
  const { priceInUsd, priceInVnd, duration, language, bestTimeToVisit } = info;
  const bookingEmail = "booking@mekongsmile.com";

  return (
    <div className="rounded-2xl border bg-white/80 p-6 shadow-booking backdrop-blur-xl">
      {priceInUsd ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-gold">${priceInUsd}</span>
            <span className="text-sm text-muted-foreground">/ person</span>
          </div>
          {priceInVnd && (
            <p className="mt-1 text-sm text-muted-foreground">
              {Number(priceInVnd).toLocaleString("vi-VN")} VND
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Contact for pricing</p>
      )}

      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600">
        <Check className="h-4 w-4 flex-shrink-0" />
        Free cancellation until 24h before
      </div>

      {(duration || language || bestTimeToVisit) && (
        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
          {duration && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-right">{duration}</span>
            </div>
          )}
          {language && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium text-right">{language}</span>
            </div>
          )}
          {bestTimeToVisit && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Best time</span>
              <span className="font-medium text-right">{bestTimeToVisit}</span>
            </div>
          )}
        </div>
      )}

      <a
        href={`mailto:${bookingEmail}?subject=${encodeURIComponent(`Booking: ${tourName}`)}`}
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-gold py-4 text-base font-bold text-brand-navy transition-all hover:bg-brand-gold-light active:scale-[0.98]"
      >
        Book Now
      </a>
      <p className="mt-2 text-center text-xs text-muted-foreground">Instant confirmation</p>
    </div>
  );
}
