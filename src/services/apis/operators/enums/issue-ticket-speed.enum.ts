export enum IssueTicketSpeedEnum {
  INSTANT = "InstantIssuance",
  FAST = "FastIssuance",
  STANDARD = "StandardIssuance",
  SLOW = "SlowIssuance",
}

export function getIssueTicketSpeedLabel(speed: IssueTicketSpeedEnum): {
  title: string;
  description?: string;
  subTitle?: string;
} {
  switch (speed) {
    case IssueTicketSpeedEnum.INSTANT:
      return {
        title: "Xuất vé ngay lập tức",
        description:
          "Vé sẽ được xuất ngay lập tức sau khi thanh toán thành công.",
        subTitle: "ngay lập tức",
      };
    case IssueTicketSpeedEnum.FAST:
      return {
        title: "Xuất vé nhanh",
        description:
          "Vé sẽ được xuất dưới 2 tiếng sau khi thanh toán thành công.",
        subTitle: "trong vòng 2 tiếng",
      };
    case IssueTicketSpeedEnum.STANDARD:
      return {
        title: "Xuất vé tiêu chuẩn",
        description:
          "Vé sẽ được xuất trong vòng 2 tiếng đến 4 tiếng sau khi thanh toán thành công.",
        subTitle: "trong vòng 2 tiếng đến 4 tiếng",
      };
    case IssueTicketSpeedEnum.SLOW:
      return {
        title: "Xuất vé chậm",
        description:
          "Vé sẽ được xuất trong vòng 1 ngày sau khi thanh toán thành công.",
        subTitle: "trong vòng 1 ngày",
      };
    default:
      return {
        title: "Không xác định",
      };
  }
}
