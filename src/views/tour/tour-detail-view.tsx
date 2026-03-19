import type { TourDetail } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import TourBentoGallery from "./tour-bento-gallery";
import TourInfoBadges from "./tour-info-badges";
import TourMobileCtaBar from "./tour-mobile-cta-bar";
import TourPricingSection from "./tour-pricing-section";
import TourIncludesSection from "./tour-includes-section";
import TourMeetingSection from "./tour-meeting-section";
import TourFaqSection from "./tour-faq-section";
import TourStickyTabs from "./tour-sticky-tabs";

type Props = {
  tour: TourDetail;
};

export default function TourDetailView({ tour }: Props) {
  const info = tour.shortTourInformation;
  const galleryImages = [
    ...(tour.image ? [tour.image] : []),
    ...(tour.featuredImage?.node && !tour.image ? [tour.featuredImage.node] : []),
    ...(tour.galleryImages?.nodes ?? []),
  ].map((img) => ({ sourceUrl: img.sourceUrl, altText: img.altText }));

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 pb-24 md:px-8 lg:pb-8">
      {/* Full-width bento gallery */}
      <TourBentoGallery images={galleryImages} />

      {/* Sticky section tabs — appears after scrolling past gallery */}
      <TourStickyTabs
        availableSections={[
          "overview",
          ...(tour.description ? ["itinerary"] : []),
          ...(info?.includes ? ["inclusions"] : []),
          ...(info?.faq && info.faq.length > 0 ? ["faq"] : []),
          "reviews",
        ]}
      />

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* Left content — 65% */}
        <div className="flex flex-col gap-8 lg:w-[65%]">

          {/* Overview: title, rating, badges, highlights */}
          <section id="overview">
            <div>
              <h1 className="font-heading text-2xl font-bold md:text-3xl">{tour.name}</h1>
              {(tour.averageRating || tour.reviewCount) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {tour.averageRating && (
                    <span className="text-brand-gold">
                      ★ {Number(tour.averageRating).toFixed(1)}
                    </span>
                  )}
                  {tour.reviewCount && (
                    <span className="text-muted-foreground">
                      ({tour.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Info badges */}
            {info && (
              <div className="mt-4">
                <TourInfoBadges
                  duration={info.duration}
                  language={info.language}
                />
              </div>
            )}

            {/* Highlights */}
            {info?.highlights && (
              <div className="mt-4 rounded-lg border bg-white p-5">
                <h2 className="font-heading mb-3 text-xl font-semibold">Tour Highlights</h2>
                <div
                  className="prose prose-sm max-w-none [&_img]:!max-w-full [&_img]:!h-auto [&_img]:rounded-xl [&_figure]:!max-w-full [&_figure]:!w-auto"
                  dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(info.highlights) }}
                />
              </div>
            )}
          </section>

          {/* Itinerary: description with timeline styling */}
          {tour.description && (
            <section id="itinerary" className="rounded-lg border bg-white p-5">
              <h2 className="font-heading mb-3 text-xl font-semibold">Itinerary</h2>
              <div
                className="itinerary-timeline prose prose-sm max-w-none [&_img]:!max-w-full [&_img]:!h-auto [&_img]:rounded-xl [&_figure]:!max-w-full [&_figure]:!w-auto"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(tour.description) }}
              />
            </section>
          )}

          {/* Inclusions: includes / excludes */}
          {info?.includes && (
            <section id="inclusions">
              <TourIncludesSection
                included={info.includes.included}
                excluded={info.includes.excluded}
              />
            </section>
          )}

          {/* Meeting & Pickup (no tab — part of inclusions area) */}
          {info?.meetingPickup && (
            <TourMeetingSection meetingPickup={info.meetingPickup} />
          )}

          {/* FAQ */}
          {info?.faq && info.faq.length > 0 && (
            <section id="faq">
              <TourFaqSection faqs={info.faq} />
            </section>
          )}

          {/* Reviews: additional info + destinations */}
          <section id="reviews" className="flex flex-col gap-4">
            {info?.additionalInfo && (
              <div className="rounded-lg border bg-white p-5">
                <h2 className="font-heading mb-3 text-xl font-semibold">Additional Information</h2>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(info.additionalInfo) }}
                />
              </div>
            )}

            {tour.destination?.nodes?.length > 0 && (
              <div className="rounded-lg border bg-white p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Destinations</p>
                <div className="flex flex-wrap gap-2">
                  {tour.destination.nodes.map((dest) => (
                    <a
                      key={dest.databaseId}
                      href={`/destination/${dest.slug}/`}
                      className="rounded border px-2 py-1 text-xs hover:bg-muted"
                    >
                      {dest.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar — 35% (desktop only) */}
        <div className="hidden lg:block lg:w-[35%]">
          <div className="sticky top-20">
            {info && <TourPricingSection info={info} tourName={tour.name} />}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <TourMobileCtaBar price={info?.priceInUsd} tourName={tour.name} />
    </div>
  );
}
