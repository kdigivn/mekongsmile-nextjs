"use client";

import { View500 } from "@/views/error";
import { memo } from "react";

function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.error("[GlobalError]", error);

  return (
    <html>
      <body>
        <View500 />
      </body>
    </html>
  );
}

export default memo(GlobalError);
