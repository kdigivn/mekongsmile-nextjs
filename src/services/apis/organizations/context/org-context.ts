import { createContext } from "react";
import { Organization } from "../types/organization";

export const OrgContext = createContext<{
  organization: Organization | undefined;
  settings: Organization["setting"] | undefined;
  fetchOrganization: () => void;
}>({
  organization: undefined,
  settings: undefined,
  fetchOrganization: () => {},
});
