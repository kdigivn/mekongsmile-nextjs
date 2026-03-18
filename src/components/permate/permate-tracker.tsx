"use client";

import { savePermateParamsFromUrl } from "@/services/infrastructure/permate/permate-client";
import { useSearchParams } from "next/navigation";
import { memo, useEffect } from "react";

const PermateTracker = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Gọi hàm để lưu các tham số của Permate
    savePermateParamsFromUrl(searchParams);
  }, [searchParams]);

  return null;
};

export default memo(PermateTracker);
