/**
 * Danh sách các key tham số mà Permate có thể truyền vào URL.
 * Chúng ta chỉ lưu những tham số này để tránh lưu các query param không liên quan.
 */
const PERMATE_PARAM_KEYS = [
  // "utm_content",
  "pm_click_id",
  "click_uuid",
  "advertiser_id",
  "advertiser_name",
  "partner_id",
  "partner_name",
  "offer_id",
  "offer_name",
  "browser",
  "browser_version",
  "language",
  "device_brand",
  "device_model",
  "device_os",
  "device_os_version",
  "device_type",
  "country",
  "region",
  "city",
  "postal",
  "ip",
  "connection_type",
  "referer",
  "referral_id",
  "user_agent_string",
] as const; // `as const` để có type-checking tốt hơn

// Định nghĩa kiểu dữ liệu cho các tham số
type PermateParamKey = (typeof PERMATE_PARAM_KEYS)[number];
export type PermateUrlParams = {
  [key in PermateParamKey]?: string;
};

// Key để lưu trong sessionStorage
const STORAGE_KEY = "permate_tracking_params";

/**
 * Hàm này sẽ quét URL hiện tại, tìm các tham số của Permate và lưu vào sessionStorage.
 * @param urlSearchParams - Đối tượng URLSearchParams từ router của Next.js
 */
export const savePermateParamsFromUrl = (
  urlSearchParams: URLSearchParams
): void => {
  // Chỉ chạy ở phía client
  if (typeof window === "undefined") return;

  const paramsToSave: PermateUrlParams = {};
  let found = false;

  PERMATE_PARAM_KEYS.forEach((key) => {
    if (urlSearchParams.has(key)) {
      paramsToSave[key] = urlSearchParams.get(key) as string;
      found = true;
    }
  });

  // Chỉ lưu vào storage nếu tìm thấy ít nhất một tham số của Permate
  // Điều này sẽ ghi đè lên giá trị cũ, đảm bảo tracking luôn là của lần click cuối cùng
  if (found) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(paramsToSave));
    console.log("Permate params saved to session:", paramsToSave);
  }
};

/**
 * Lấy các tham số của Permate đã được lưu từ sessionStorage.
 * Bạn có thể gọi hàm này ở bất kỳ trang nào cần dùng (ví dụ: trang thanh toán).
 * @returns Một object chứa các tham số, hoặc một object rỗng nếu không có.
 */
export const getSavedPermateParams = (): PermateUrlParams => {
  if (typeof window === "undefined") return {};

  try {
    const savedParams = window.sessionStorage.getItem(STORAGE_KEY);
    return savedParams ? JSON.parse(savedParams) : {};
  } catch (error) {
    console.error(
      "Failed to parse Permate params from session storage:",
      error
    );
    return {};
  }
};
