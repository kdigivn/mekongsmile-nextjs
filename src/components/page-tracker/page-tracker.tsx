"use client";

import { memo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";

const PageTracker = () => {
  const pathname = usePathname();
  const url = buildApiPath(FerryTicketApiEndpoints.baocao.addVisitor);
  useEffect(() => {
    const trackPageView = async () => {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    };

    trackPageView();
  }, [pathname, url]);

  return null;
};

export default memo(PageTracker);
