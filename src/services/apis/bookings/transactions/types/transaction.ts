import {
  TransactionChangeTypeEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "./transaction-type-enum";

export type Transaction = {
  id: string;
  user_id: string | null;
  amount: number;
  type: TransactionTypeEnum;
  status: TransactionStatusEnum;
  time: number;
  createdAt: string;
  content: string;
  change_type?: TransactionChangeTypeEnum;
  booking_id?: string;
};
