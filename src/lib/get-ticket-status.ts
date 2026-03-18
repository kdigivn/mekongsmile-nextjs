import { TicketStatusEnum } from "@/services/apis/tickets/types/ticket-status-enum";

export function getTicketStatusColor(status: TicketStatusEnum): string {
  switch (status) {
    case TicketStatusEnum.Draft:
      return "bg-gray-500 text-white";
    case TicketStatusEnum.Booked:
      return "bg-green-500 text-white";
    case TicketStatusEnum.Cancelled:
      return "bg-red-500 text-white";
    default:
      return "bg-black text-white";
  }
}
export function getTicketStatusName(status: TicketStatusEnum): string {
  switch (status) {
    case TicketStatusEnum.Draft:
      return "Chờ xử lý";
    case TicketStatusEnum.Booked:
      return "Đã xuất vé";
    case TicketStatusEnum.Cancelled:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}
