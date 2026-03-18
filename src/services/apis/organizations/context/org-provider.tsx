"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Organization } from "../types/organization";
import { useGetCurrentOrganizationQuery } from "../organization.service";
import { OrgContext } from "./org-context";

function OrgProvider({ children }: PropsWithChildren<object>) {
  const { organization: newOrg, organizationRefetch } =
    useGetCurrentOrganizationQuery();
  const [organization, setOrganization] = useState<Organization | undefined>(
    newOrg
  );
  const [settings, setSettings] = useState<Organization["setting"] | undefined>(
    organization?.setting
  );

  const fetchOrganization = useCallback(() => {
    organizationRefetch();
  }, [organizationRefetch]);

  useEffect(() => {
    if (newOrg) {
      setOrganization(newOrg);
      setSettings(newOrg.setting);
    }
  }, [newOrg]);

  const contextValue = useMemo(
    () => ({
      settings,
      organization,
      fetchOrganization,
    }),
    [settings, organization, fetchOrganization]
  );

  return (
    <OrgContext.Provider value={contextValue}> {children} </OrgContext.Provider>
  );
}

export default OrgProvider;
