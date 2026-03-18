type MeetingPickup = {
  pickupPoint: string | null;
  startTime: string | null;
  pickupDetails: string | null;
  linkGoogleMaps: string | null;
};

type Props = {
  meetingPickup: MeetingPickup;
};

export default function TourMeetingSection({ meetingPickup }: Props) {
  const { pickupPoint, startTime, pickupDetails, linkGoogleMaps } =
    meetingPickup;

  if (!pickupPoint && !startTime && !pickupDetails) return null;

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">Meeting & Pickup</h2>
      <div className="flex flex-col gap-3 text-sm">
        {pickupPoint && (
          <div className="flex gap-2">
            <span className="w-28 font-medium text-muted-foreground">
              Pickup point:
            </span>
            <span>{pickupPoint}</span>
          </div>
        )}
        {startTime && (
          <div className="flex gap-2">
            <span className="w-28 font-medium text-muted-foreground">
              Start time:
            </span>
            <span>{startTime}</span>
          </div>
        )}
        {pickupDetails && (
          <div>
            <p className="mb-1 font-medium text-muted-foreground">
              Pickup details:
            </p>
            <p className="text-sm">{pickupDetails}</p>
          </div>
        )}
        {linkGoogleMaps && (
          <a
            href={linkGoogleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 rounded border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
          >
            View on Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
