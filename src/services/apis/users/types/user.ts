// import { FileEntity } from "../../files/types/file-entity";
import { Customer } from "../../customers/types/customer";
import { Status } from "../../customers/types/status";
import { Organization } from "../../organizations/types/organization";
import { Role } from "./role";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  id: string;
  email: string;
  email_verified?: Date;
  provider: UserProviderEnum;
  socialId: string | null;
  role: Role;
  status: Status;
  customer_id: number;
  customer: Customer;
  last_login_at: Date | null;
  createdAt: string;
  updatedAt: string;
  organization_id: string;
  organization: Organization;
};
