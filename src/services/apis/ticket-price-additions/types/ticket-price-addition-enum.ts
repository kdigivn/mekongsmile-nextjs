export type StaticOptionType = {
  label: string;
  val: string;
};

export enum AmountChangeTypeEnum {
  PERCENTAGE = "percentage",
  FLAT = "flat",
}

export enum TicketPriceAdditionTypeEnum {
  FEE = "fee",
  PROMOTION = "promotion",
  /**
   * Ticket Price Additions of this type is the final addition layer that will be apply.
   *
   * Example usage: A staff can set an overlay price addition that charge additional 10% of the final price.
   */
  OVERLAY = "overlay",
}

export enum TicketPriceAdditionChangeTypeEnum {
  Increase = "INC",
  Decrease = "DEC",
}

export enum AdditionSeatTypeEnum {
  ECO = "ECO / thuong",
  VIP = "VIP",
  DELUXE = "DELUXE",
  BED = "BED",
  CHAIR = "CHAIR",
  PHOTHONG = "PhoThong",
  THUONGGIA = "ThuongGia",
  NGUYENTHU = "NguyenThu",
  BIKE_LT_195 = "Xe gắn máy, mô tô < 195 (CC)",
  BIKE_GTE_195 = "Xe mô tô >= 195 (CC)",
  CAR_4_5 = "Xe ô tô 4-5 chỗ",
  CAR_7_9_PICKUP_4_5 = "Xe ô tô 7-9 chỗ/bán tải 4-5 chỗ",
  CAR_10_16_PICKUP_6 = "Xe ô tô 10-16 chỗ/bán tải 6 chỗ",
  CAR_17_25 = "Xe ô tô 17-25 chỗ",
  CAR_26 = "Xe ô tô 26 chỗ trở lên",
}

export enum AdditionTicketTypeEnum {
  ADULT_TICKET = "người lớn / vé người lớn",
  CHILD_TICKET = "vé trẻ em / trẻ em / trẻ em (từ 6-11 tuổi)",
  OLD_TICKET = "người già / vé người già / vé người cao tuổi / người cao tuổi/ người cao tuổi (từ 60 tuổi)",
  DISABLE_TICKET = "vé người khuyết tật / người khuyết tật / Khuyết tật",
  INVITE_TICKET = "vé mời / vé miễn phí",
  STUDENT = "sinh viên / vé sinh viên",
  VIP_TICKET = "vé vip",
  LOCAL_TICKET = "vé địa phương / địa phương",
}

export const ADDITION_TICKET_TYPE_OPTIONS: StaticOptionType[] = [
  {
    label: "Người lớn",
    val: AdditionTicketTypeEnum.ADULT_TICKET,
  },
  {
    label: "Trẻ em",
    val: AdditionTicketTypeEnum.CHILD_TICKET,
  },
  {
    label: "Người già",
    val: AdditionTicketTypeEnum.OLD_TICKET,
  },
  {
    label: "Người khuyết tật",
    val: AdditionTicketTypeEnum.DISABLE_TICKET,
  },
  {
    label: "Vé mời",
    val: AdditionTicketTypeEnum.INVITE_TICKET,
  },
  {
    label: "Vé học sinh/ sinh viên",
    val: AdditionTicketTypeEnum.STUDENT,
  },
  {
    label: "Vé VIP",
    val: AdditionTicketTypeEnum.VIP_TICKET,
  },
  {
    label: "Vé địa phương",
    val: AdditionTicketTypeEnum.LOCAL_TICKET,
  },
];
