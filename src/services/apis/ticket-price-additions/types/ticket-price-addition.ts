import {
  AmountChangeTypeEnum,
  TicketPriceAdditionChangeTypeEnum,
  TicketPriceAdditionTypeEnum,
} from "./ticket-price-addition-enum";

export type TicketPriceAddition = {
  id: string;
  title: string;
  description: string | null;

  priority: number;

  type: TicketPriceAdditionTypeEnum;
  change_type: TicketPriceAdditionChangeTypeEnum;
  amount_change_type: AmountChangeTypeEnum;
  amount: number;
  isDisplay: boolean;
  isActive: boolean;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdBy: string;
  createdAt: Date;

  updatedAt: Date;
};
