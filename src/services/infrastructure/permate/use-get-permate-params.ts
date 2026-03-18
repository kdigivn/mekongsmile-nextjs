import { useState, useEffect } from "react";
import { PermateUrlParams, getSavedPermateParams } from "./permate-client";
export const useGetPermateParams = (): PermateUrlParams => {
  const [params, setParams] = useState<PermateUrlParams>({});

  useEffect(() => {
    setParams(getSavedPermateParams());
  }, []);

  return params;
};
