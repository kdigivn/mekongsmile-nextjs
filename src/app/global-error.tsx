"use client";

import { View500 } from "@/views/error";
import * as Sentry from "@sentry/nextjs";
import { memo, useEffect } from "react";

function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        {/* <NextError statusCode={0} /> */}

        <View500 />
      </body>
    </html>
  );
}

export default memo(GlobalError);
