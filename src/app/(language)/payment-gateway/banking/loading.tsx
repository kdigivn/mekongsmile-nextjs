"use client";

import { Progress } from "@heroui/react";
import BookingIdSkeleton from "../../booking/[id]/_components/booking-id-skeleton";

function Loading() {
  return (
    <div className="w-full">
      <Progress
        size="sm"
        isIndeterminate
        aria-label="Loading..."
        className="w-full"
      />

      <BookingIdSkeleton />
    </div>
  );
}

export default Loading;
