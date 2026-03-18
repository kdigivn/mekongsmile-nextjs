import { Transaction } from "./../transactions/types/transaction";
import { CreateOrder, Order } from "../../orders/types/order";
import { BookingStatusEnum } from "./booking-status-enum";
import { Customer } from "../../customers/types/customer";
import { Route } from "../../routes/types/route";
import { BookingPaymentStatusEnum } from "./booking-payment-status-enum";
import { VATInvoice } from "./vat-invoice";
import { PermateTracking } from "../../permate/types/permate-tracking";

export type Booking = {
  _id: string;
  id: string;
  depart_order_id?: string;
  depart_order: Order;
  depart_route_id?: number;
  depart_route?: Route;
  return_order_id?: string;
  return_order: Order;
  return_route_id?: number;
  return_route?: Route;
  customer_id?: number;
  customer?: Customer;
  company_id?: number;
  lead_id?: string;
  balance: number;
  // round_trip: boolean;
  booking_status: BookingStatusEnum;
  payment_status: BookingPaymentStatusEnum;
  orderer_name: string;
  phone_number: string;
  phone_country_code?: string | null;
  contact_email: string;
  orderer_social_id?: string;
  VAT_tax_number: string;
  VAT_buyer_name: string;
  VAT_company_name: string;
  VAT_company_address: string;
  VAT_email: string;
  VAT_invoice?: VATInvoice;
  no_tickets: number;
  // no_passengers: number;
  // Tổng giá khách phải trả
  total_ticket_price: number;
  // Tổng tiền hệ thống phải trả cho hãng tàu chưa bao gồm phí cảng
  total_agent_price: number;
  total_harbor_fee: number;
  total_price: number;
  cost: number;
  profit: number;
  revenue: number;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
  permateTracking?: PermateTracking;
  total_discount?: number;
  payment_expired_at?: Date | null;
};

export type CreateBooking = Omit<
  Booking,
  | "_id"
  | "id"
  | "depart_order"
  | "return_order"
  | "createdAt"
  | "updatedAt"
  | "customer"
  | "depart_route"
  | "return_route"
  | "cost"
  | "profit"
  | "revenue"
  | "created_by"
  | "payment_status"
  | "balance"
  | "total_price"
  | "total_harbor_fee"
  | "total_agent_price"
  | "total_ticket_price"
  | "no_tickets"
> & { depart_order: CreateOrder; return_order?: CreateOrder };

export type BookingDetail = {
  id: string;
  depart_order_id: string;
  depart_order: Order;
  return_order_id: string;
  return_order: Order;
  user_id: string;
  user: User;
  transactions: Transactions[];
  round_trip: boolean;
  booking_status: number;
  orderer_name: string;
  phone_number: string;
  phone_country_code?: string | null;
  contact_email: string;
  VAT_tax_number: string;
  VAT_buyer_name: string;
  VAT_company_name: string;
  VAT_company_address: string;
  VAT_email: string;
  no_tickets: number;
  no_passengers: number;
  total_ticket_price: number;
  total_agent_price: number;
  total_harbor_fee: number;
  total_price: number;
  createdAt: string;
  updatedAt: string;
};

export type OperatorLogo = { id: string; path: string };

export type User = {
  id: string;
  email: string;
  provider: string;
  socialId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

export type Role = { id: number };

export type Status = { id: number };

export type Transactions = { transaction_id: string; transaction: Transaction };
