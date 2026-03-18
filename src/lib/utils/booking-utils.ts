import { Booking } from "@/services/apis/bookings/types/booking";
import { AmountChangeTypeEnum } from "@/services/apis/ticket-price-additions/types/ticket-price-addition-enum";
import { Voucher } from "@/services/apis/voucher/type/voucher";

export const calculateVoucherDiscountAmount = (
  vouchers: Voucher[],
  totalAmount: number
) => {
  let totalCash = 0;
  let totalPercentage = 0;

  if (vouchers.length === 0) {
    return 0;
  }

  vouchers.forEach((voucher) => {
    const amount = voucher.amount ?? 0;

    if (voucher.amount_type === AmountChangeTypeEnum.PERCENTAGE) {
      totalPercentage += amount;
    } else {
      totalCash += amount;
    }
  });

  const percentDiscount = totalAmount
    ? (totalAmount * totalPercentage) / 100
    : 0;

  const finalDiscount = totalCash + percentDiscount;
  if (finalDiscount > totalAmount) {
    return totalAmount;
  }

  return finalDiscount;
};

export const calculateBookingTotalDiscount = (booking: Booking) => {
  const totalManualDiscount = booking?.total_discount ?? 0;
  const totalDepartVoucherDiscount = calculateVoucherDiscountAmount(
    booking?.depart_order?.vouchers ?? [],
    (booking?.depart_order?.total_ticket_price ?? 0) +
      (booking?.depart_order?.total_harbor_fee ?? 0)
  );
  const totalReturnVoucherDiscount = booking?.return_order
    ? calculateVoucherDiscountAmount(
        booking?.return_order?.vouchers ?? [],
        (booking?.return_order?.total_ticket_price ?? 0) +
          (booking?.return_order?.total_harbor_fee ?? 0)
      )
    : 0;
  return (
    totalManualDiscount +
    totalDepartVoucherDiscount +
    totalReturnVoucherDiscount
  );
};
