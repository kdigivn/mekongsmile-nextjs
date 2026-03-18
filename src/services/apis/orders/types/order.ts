import { Customer } from "../../customers/types/customer";
import { CreateTicket, Ticket } from "../../tickets/types/ticket";
import { Voucher } from "../../voucher/type/voucher";
import { Voyage } from "../../voyages/types/voyage";
import { EmbeddedEInvoice } from "./embedded-invoice";
import { OrderPaymentStatusEnum } from "./order-payment-status.enum";
import { OrderStatusEnum } from "./order-status-enum";

export type DiscountFromData = {
  discount_amount?: number;
  discount_reason?: string;
  discount_type?: string;
};

export type Order = {
  id: string;
  voyage?: Voyage;
  voyage_id: string;
  voyage_depart_date: Date;
  customer_id?: number;
  customer?: Customer;
  company_id?: string;
  order_status: OrderStatusEnum;
  vendor_order_id: string;
  orderer_name: string;
  phone_number: string;
  contact_email: string;
  orderer_social_id?: string;
  // Tổng giá khách phải trả
  total_ticket_price: number;
  // Tổng tiền hệ thống phải trả cho hãng tàu chưa bao gồm phí cảng
  total_agent_price: number;
  total_harbor_fee: number;
  total_price: number;
  discount?: DiscountFromData | null;
  vouchers?: Voucher[];
  tickets: Ticket[];
  tickets_file: TicketFile;
  harbor_fee_file: HarborFeeFile;
  // ID of User create this order
  created_by?: string;
  issue_ticket_error?: string | null;
  payment_status?: OrderPaymentStatusEnum;
  total_refund_amount?: number;
  total_discount?: number;
  eInvoice?: EmbeddedEInvoice;
};

export type CreateOrder = Pick<
  Order,
  | "voyage_id"
  | "customer_id"
  | "company_id"
  | "orderer_name"
  | "phone_number"
  | "contact_email"
  | "discount"
  | "vouchers"
  | "orderer_social_id"
> & {
  tickets: CreateTicket[];
};

export type TicketFile = { id: string; path: string | null };

export type HarborFeeFile = { id: string; path: string };
