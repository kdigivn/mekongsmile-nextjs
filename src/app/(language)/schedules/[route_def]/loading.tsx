import BookingStep from "@/components/page-section/booking-step";
import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div className="w-full">
      {/* <div className="container min-h-[calc(100vh_-_64px)] max-w-screen-xl py-4"> */}
      <div className="lg:px-auto mx-auto flex min-h-[calc(100vh_-_65px)] w-full max-w-screen-xl flex-col items-center gap-4 px-5 py-4 md:px-10">
        <div className="mb-4 flex w-full justify-center">
          <BookingStep currentStep={1} className="max-w-[500px]" />
        </div>
        <div className="col-span-12 flex w-full flex-col gap-2 lg:col-span-3">
          <Skeleton className="h-28 w-full max-w-full rounded-lg bg-neutral-200 p-2 shadow-md lg:mb-6 lg:flex lg:justify-center lg:p-8" />
          <div className="grid w-full grid-cols-12 gap-3">
            <Skeleton className="col-span-12 flex h-32 flex-col gap-2 rounded-lg bg-neutral-200 lg:col-span-3" />
            <Skeleton className="col-span-12 flex h-80 flex-col gap-2 rounded-lg bg-neutral-200 lg:col-span-9" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
