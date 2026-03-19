"use client";

type Props = {
  price?: number | null;
  tourName?: string;
  bookingEmail?: string;
};

export default function TourMobileCtaBar({ price, tourName, bookingEmail }: Props) {
  const email = bookingEmail ?? "booking@mekongsmile.com";
  const subject = tourName ? `Booking: ${tourName}` : "Booking inquiry";

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-white p-4 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">From</p>
          <p className="text-xl font-bold text-brand-gold">{price ? `$${price}` : "N/A"}</p>
        </div>
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
          className="flex-1 rounded-lg bg-brand-gold px-6 py-3 text-center font-bold text-brand-navy transition-colors hover:bg-brand-gold-light"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}
