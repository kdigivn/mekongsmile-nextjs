import { Organization } from "../../organizations/types/organization";
import { AmountChangeTypeEnum } from "../../ticket-price-additions/types/ticket-price-addition-enum";

export type Voucher = {
  id: string;
  title?: string;
  description?: string;
  voucher_code?: string;
  amount_type?: AmountChangeTypeEnum;
  amount?: number;
  usage_limit?: number;
  usage_count?: number;
  is_unique?: boolean;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  applied_orders?: string[] | null;
  organization_id?: Organization["id"];
  organization?: Organization | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string | null;
};
