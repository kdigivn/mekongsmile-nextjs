import BookingStep from "@/components/page-section/booking-step";
import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div className="w-full">
      <div className="container max-w-screen-xl py-4">
        <div className="mb-4 flex w-full justify-center">
          <BookingStep currentStep={2} className="max-w-[500px]" />
        </div>
        <div className="flex flex-col items-center justify-center gap-3">
          <Skeleton className="h-10 w-40 rounded-lg bg-neutral-200" />
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 rounded-lg bg-neutral-200" />
              <Skeleton className="h-20 rounded-lg bg-neutral-200" />
              <Skeleton className="h-[12.5rem] rounded-lg bg-neutral-200" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-96 rounded-lg bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
