import { OrganizationSettings } from "./organization-setting";

export type Organization = {
  id: string;
  name: string;
  // logo: string | null;
  slug: string;
  parent_id: string;
  depth_level: number;
  setting?: OrganizationSettings;
  balance: number;
  credit: number;
  created_by: string;
  createdAt: string;
  updatedAt: string;
};
