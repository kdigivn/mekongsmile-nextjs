import { calculateVoucherDiscountAmount, formatCurrency } from "@/lib/utils";
import { SeatTicket } from "@/services/apis/boatLayouts/types/seat";
import { CreateOrder } from "@/services/apis/orders/types/order";
import { useGetRouteById } from "@/services/apis/routes/routes.service";
import { CreateTicket } from "@/services/apis/tickets/types/ticket";
import { TicketGenderEnum } from "@/services/apis/tickets/types/ticket-gender-enum";
import { Voucher } from "@/services/apis/voucher/type/voucher";
import { Voyage } from "@/services/apis/voyages/types/voyage";
import { FormPassengerTicket } from "@/services/form/types/form-types";
import { useTranslation } from "@/services/i18n/client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import ApplyVoucherModal from "../_modal/apply-voucher-popover";
import ListVoucherModal from "../_modal/list-voucher";

type Props = {
  voyage: Voyage;
  vouchers?: Voucher[];
  selectedSeats: SeatTicket[];
  onVouchersChange?: (vouchers: Voucher[]) => void;
};

function TotalFeeSection({
  voyage,
  vouchers,
  selectedSeats,
  onVouchersChange,
}: Props) {
  const [harborFee, setHarborFee] = useState<number>(0);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [isOrderFromValid, setIsOrderFromValid] = useState<boolean>(true);
  const [orderToApplyVoucher, setOrderToApplyVoucher] = useState<
    CreateOrder | undefined
  >(undefined);
  const { route, routesLoading, routesError } = useGetRouteById(
    voyage.route_id
  );

  useEffect(() => {
    if (!routesLoading && !routesError && route) {
      const harborFee = route.operators?.find(
        (operator) => operator.operator_id === voyage.operator_id
      )?.harbor_fee;

      setHarborFee(harborFee ?? 0);
    }
  }, [route, routesError, routesLoading, voyage.operator_id]);

  const { getValues, trigger } = useFormContext();

  const passengers: FormPassengerTicket[] = getValues("passengers");

  const { t } = useTranslation("ticket-detail");

  const totalTicketPrice = useMemo(() => {
    return passengers
      ? passengers.reduce(
          (total: number, passenger: FormPassengerTicket) =>
            total + (passenger.price ?? 0),
          0
        )
      : 0;
  }, [passengers]);

  const totalHarborFee = useMemo(() => {
    return passengers ? passengers.length * harborFee : 0;
  }, [passengers, harborFee]);

  const totalDiscount = useMemo(() => {
    return calculateVoucherDiscountAmount(
      vouchers ?? [],
      totalTicketPrice + totalHarborFee
    );
  }, [vouchers, totalTicketPrice, totalHarborFee]);

  const handleListVoucher = useCallback(async () => {
    const isValid = await trigger();

    if (isValid) {
      const cusInfor = getValues("pic");
      const selectedSeatsWithPassengerData = selectedSeats.map<
        CreateTicket | undefined
      >((seat) => {
        const foundPassengerData = getValues("passengers")?.find(
          (passenger: FormPassengerTicket) =>
            passenger.positionId === seat.seatMetadata.PositionId
        );

        if (foundPassengerData) {
          const {
            nationality,
            dateOfBirth,
            gender,
            plateNumber,
            name,
            socialId,
            address,
          } = foundPassengerData;
          const ticket: CreateTicket = {
            name: name ?? "",
            date_of_birth: dateOfBirth ?? "",
            // place_of_birth: "",
            social_id: socialId ?? "",
            national_id: nationality.national_id
              ? nationality.national_id.toString()
              : "VN",
            ...(voyage.operator?.configs.passenger_inputs.gender.enable && {
              gender: gender ?? TicketGenderEnum.Male,
            }),
            ...(voyage.operator?.configs.passenger_inputs.plate_number
              .enable && {
              plate_number: plateNumber ?? "",
            }),
            // email: "",
            // phone_number: "",
            home_town: address ?? "",
            seat_id: seat.seatMetadata.SeatId.toString(),
            seat_name: seat.seatMetadata.SeatName,
            position_id: seat.seatMetadata.PositionId.toString(),
            // price: seat.selectedTicketPrice?.price_with_VAT ?? 0,
            ticket_type_id: seat.selectedTicketPrice?.ticket_type_id,
            seat_type_code: seat.selectedTicketPrice?.seat_type ?? "",
            is_child: false,
            is_vip: seat.seatMetadata.IsVIP,
            ticket_price_id: seat.selectedTicketPrice?.id,
            sort_auto: seat.seatMetadata.SortAuto,
            floor_id: seat.seatMetadata.FloorId,
          };
          return ticket;
        }
        return undefined;
      });

      const voucherForOrderRequest: CreateOrder = {
        voyage_id: voyage.id,
        customer_id: cusInfor?.id ?? 1,
        orderer_name: `${cusInfor?.picName}`,
        phone_number: cusInfor?.picPhone ?? "",
        contact_email: cusInfor?.picEmail ?? "",
        tickets: selectedSeatsWithPassengerData.filter(
          (ticket) => ticket !== undefined
        ) as CreateTicket[],
        vouchers: vouchers ?? [],
        // voyage_depart_date: voyage.departure_date
        //   ? parseISO(voyage.departure_date)
        //   : new Date(),
        // order_status: OrderStatusEnum.Requested,
        // total_ticket_price: totalTicketPrice,
        // total_agent_price: 0,
        // total_harbor_fee: totalHarborFee,
        // total_price: totalTicketPrice + totalHarborFee,
      };
      setOrderToApplyVoucher(voucherForOrderRequest);
      setIsOrderFromValid(true);
      setIsVoucherModalOpen(true);
    } else {
      setIsOrderFromValid(false);
    }
  }, [
    trigger,
    getValues,
    selectedSeats,
    voyage.id,
    voyage.operator?.configs.passenger_inputs.gender.enable,
    voyage.operator?.configs.passenger_inputs.plate_number.enable,
    vouchers,
  ]);

  const onApplyVoucher = useCallback(
    (newVouchers: Voucher[]) => {
      // const newDiscount = calculateVoucherDiscountAmount(
      //   newVouchers,
      //   totalHarborFee + totalTicketPrice
      // );
      // if (newDiscount > totalHarborFee + totalTicketPrice) {
      //   return false;
      // }
      onVouchersChange?.(newVouchers);
      return true;
    },
    [onVouchersChange]
  );

  const handleRemoveVoucher = useCallback(
    (vouchers: Voucher[]) => {
      if (onVouchersChange) {
        onVouchersChange(vouchers);
      }
    },
    [onVouchersChange]
  );

  return (
    <div className="flex flex-col gap-2 rounded-md md:flex-nowrap lg:col-span-5">
      <div className="flex w-full flex-col gap-2 rounded-md bg-default-200 px-3 py-2">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <p className="font-semibold">{t("voucher.title")}</p>{" "}
          <ApplyVoucherModal
            isOpen={isVoucherModalOpen}
            setIsOpen={setIsVoucherModalOpen}
            orderToApplyVoucher={orderToApplyVoucher}
            onApplyVoucher={onApplyVoucher}
            vouchers={vouchers}
            handleListVoucher={handleListVoucher}
          />
        </div>
        {!isOrderFromValid && (
          <p className="text-sm text-danger">
            Vui lòng điền{" "}
            <span className="font-bold">thông tin hành khách</span> và{" "}
            <span className="font-bold">thông tin liên hệ</span> để áp dụng mã
            Voucher
          </p>
        )}
        <ListVoucherModal
          vouchers={vouchers}
          onRemoveVoucher={handleRemoveVoucher}
        />
      </div>
      <div className="flex h-full w-full flex-col gap-2 rounded-md bg-default-200 px-3 py-2">
        {/* Total */}
        <div className="flex flex-row items-center gap-2 text-sm">
          <p>{t("passenger-details.ticket-price")}</p>
          <span className="font-bold">{`${formatCurrency(totalTicketPrice)}`}</span>
        </div>
        {/* Harbor fee */}
        <div className="flex gap-2 text-sm">
          {t("passenger-details.fee-harbor")}
          <span>{`${formatCurrency(totalHarborFee)}`}</span>
        </div>
        {/* Total discount */}
        <div className="flex flex-row items-center gap-2 text-sm">
          <p>{t("passenger-details.total-discount")}</p>
          <span className="font-bold text-success">
            {totalDiscount > 0 ? `-${formatCurrency(totalDiscount)}` : "0 VND"}
          </span>
        </div>
        <div className="flex flex-row items-center gap-2 text-sm">
          <p className="font-semibold">{t("passenger-details.total")}</p>
          <span className="font-bold text-danger">
            {`${formatCurrency(totalTicketPrice + totalHarborFee - totalDiscount)}`}
          </span>
        </div>
        {/* Domestic fee */}
        {/* <div className="flex gap-2 text-sm">
                {t ("passenger-details.fee-domestic")}
                <span className="font-bold text-danger">{0}đ</span>
              </div> */}
        {/* International fee */}
        {/* <div className="flex gap-2 text-sm">
                {t ("passenger-details.fee-international")}
                <span className="font-bold text-danger">{0}đ</span>
              </div> */}
      </div>
    </div>
  );
}

export default memo(TotalFeeSection);
