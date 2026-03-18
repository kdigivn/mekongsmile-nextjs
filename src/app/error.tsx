"use client";

import { memo } from "react";
import { View500 } from "@/views/error";

// ----------------------------------------------------------------------

export const metadata = {
  title: "500 Internal Server Error",
};

function Error() {
  return <View500 />;
}

export default memo(Error);
