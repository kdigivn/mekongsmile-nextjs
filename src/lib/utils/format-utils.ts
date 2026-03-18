import { format } from "date-fns";

export const formatCurrency = (
  amount: number,
  locale: string = "vi-VN",
  currency: string = "VND",
  currencyDisplay: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry = "code"
): string => {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
    currencyDisplay,
  });
};

type ShortenUnit = {
  symbol?: string;
  thousand: string;
  million: string;
  billion: string;
};

const shortenUnitMap: Record<string, ShortenUnit> = {
  VND: { symbol: "₫", thousand: "k", million: "Tr", billion: "tỷ" },
  USD: { symbol: "$", thousand: "k", million: "M", billion: "B" },
};

export const formatCurrencyWithShorten = (
  amount: number,
  currency: string = "VND"
): string => {
  const unit = shortenUnitMap[currency] ?? shortenUnitMap["VND"];

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} ${unit.billion} ${unit.symbol ?? ""}`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} ${unit.million} ${unit.symbol ?? ""}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}${unit.thousand} ${unit.symbol ?? ""}`;
  }
  return `${amount} ${unit.symbol ?? ""}`;
};

export const formatRelativeTime = (inputDate: string | Date): string => {
  const date =
    typeof inputDate === "string" ? new Date(inputDate + "Z") : inputDate;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds <= 0) {
    return "Vừa xong";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};

export const formatHourString = (hourTime: string | undefined) => {
  if (hourTime === undefined) return "";
  const fakeDate = "2000-01-01";
  return format(new Date(`${fakeDate}T${hourTime}`), "HH:mm");
};

export const getFormateVoyageDate = (
  date: string | null,
  time: string | null,
  formatString = "HH:mm dd/MM/yyyy"
) => {
  if (!date || !time) {
    return undefined;
  }

  try {
    const combinedDateTime = `${date}T${time}`;
    const parsedDate = new Date(combinedDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return undefined;
    }

    return format(parsedDate, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return undefined;
  }
};
