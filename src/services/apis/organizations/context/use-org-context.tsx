"use client";

import { useContext } from "react";
import { OrgContext } from "./org-context";

export const useOrganizationContext = () => {
  const context = useContext(OrgContext);

  if (!context)
    throw new Error("useOrgContext context must be use inside OrgProvider");

  return context;
};
