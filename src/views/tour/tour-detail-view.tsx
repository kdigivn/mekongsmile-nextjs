import type { TourDetail } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";
import TourGallery from "./tour-gallery";
import TourPricingSection from "./tour-pricing-section";
import TourIncludesSection from "./tour-includes-section";
import TourMeetingSection from "./tour-meeting-section";
import TourFaqSection from "./tour-faq-section";

type Props = {
  tour: TourDetail;
};

export default function TourDetailView({ tour }: Props) {
  const info = tour.shortTourInformation;
  const galleryImages = tour.galleryImages?.nodes ?? [];
  const featuredImage = tour.image ?? tour.featuredImage?.node ?? null;

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-8">
      <h1 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
        {tour.name}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: gallery + content */}
        <div className="flex flex-col gap-6 lg:w-8/12">
          <TourGallery
            featuredImage={featuredImage}
            galleryImages={galleryImages}
            tourName={tour.name}
          />

          {/* Description */}
          {tour.description && (
            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold">Tour Overview</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(tour.description),
                }}
              />
            </div>
          )}

          {/* Highlights */}
          {info?.highlights && (
            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold">Tour Highlights</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(info.highlights),
                }}
              />
            </div>
          )}

          {/* Includes / Excludes */}
          {info?.includes && (
            <TourIncludesSection
              included={info.includes.included}
              excluded={info.includes.excluded}
            />
          )}

          {/* Meeting & Pickup */}
          {info?.meetingPickup && (
            <TourMeetingSection meetingPickup={info.meetingPickup} />
          )}

          {/* FAQ */}
          {info?.faq && info.faq.length > 0 && (
            <TourFaqSection faqs={info.faq} />
          )}

          {/* Additional info */}
          {info?.additionalInfo && (
            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold">
                Additional Information
              </h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(info.additionalInfo),
                }}
              />
            </div>
          )}
        </div>

        {/* Right: sticky pricing */}
        <div className="lg:w-4/12">
          <div className="sticky top-20 flex flex-col gap-4">
            {info && <TourPricingSection info={info} tourName={tour.name} />}

            {tour.destination?.nodes?.length > 0 && (
              <div className="rounded-lg border bg-white p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Destinations
                </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
