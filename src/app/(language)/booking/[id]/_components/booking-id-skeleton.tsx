import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

function BookingIdSkeleton() {
  return (
    <div className="lg:px-auto mx-auto flex min-h-[calc(100vh_-_65px)] w-full max-w-screen-xl flex-col items-center gap-4 px-5 py-4 md:px-10">
      <div className="mb-4 flex w-full justify-center">
        <Skeleton className="h-14 w-full max-w-[500px] bg-neutral-200" />
      </div>
      <div className="flex w-full flex-col justify-center">
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2">
            <div className="flex w-full flex-row justify-center gap-3 text-foreground md:w-full md:flex-none">
              <Skeleton className="h-7 w-full max-w-36 bg-neutral-200"></Skeleton>
              <Skeleton className="h-7 w-full max-w-36 bg-neutral-200"></Skeleton>
            </div>
            <div className="flex w-full flex-col gap-4">
              <Skeleton className="place-content-inherit align-items-inherit relative grid h-24 w-full flex-auto grid-cols-12 flex-col items-center gap-3 overflow-y-auto break-words bg-neutral-200 p-3 text-left subpixel-antialiased"></Skeleton>
            </div>

            <div className="flex w-full flex-col gap-4">
              <Skeleton className="place-content-inherit align-items-inherit relative grid h-12 w-full flex-auto grid-cols-12 flex-col items-center gap-3 overflow-y-auto break-words bg-neutral-200 p-3 text-left subpixel-antialiased"></Skeleton>
            </div>

            <div className="flex w-full flex-col gap-4">
              <Skeleton className="place-content-inherit align-items-inherit relative grid h-[100px] w-full flex-auto grid-cols-12 flex-col items-center gap-3 overflow-y-auto break-words bg-neutral-200 p-3 text-left subpixel-antialiased"></Skeleton>
            </div>
            <div className="w-full overflow-hidden">
              <div className={`flex w-full flex-row gap-4`}>
                <div
                  className="flex flex-none flex-row gap-4 lg:w-full lg:!grid-cols-2"
                  style={{
                    gridTemplateColumns: `repeat(2, minmax(320px, 320px))`,
                  }}
                >
                  <Skeleton
                    className={`flex h-80 w-72 flex-col gap-3 rounded-md bg-neutral-200 p-3 md:h-96 md:w-full md:flex-none lg:col-span-1 lg:w-full`}
                  ></Skeleton>
                  <Skeleton
                    className={`flex h-80 w-72 flex-col gap-3 rounded-md bg-neutral-200 p-3 md:h-96 md:w-96 md:flex-none lg:col-span-1 lg:w-full`}
                  ></Skeleton>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:w-1/2">
            <Skeleton className="flex h-64 flex-col gap-2 rounded-md bg-neutral-200 p-3 shadow-sm"></Skeleton>
            <Skeleton className="flex h-96 w-full flex-col gap-3 rounded-md bg-neutral-200 p-3 shadow-sm"></Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BookingIdSkeleton);
