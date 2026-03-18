/**
 * Barrel re-export for backward compatibility.
 * Prefer direct imports for tree-shaking:
 *   import { cn } from "@/lib/utils/cn";
 *   import { setSeoData } from "@/lib/utils/seo-utils";
 *   import { formatCurrency } from "@/lib/utils/format-utils";
 */

// Core
export { cn } from "./utils/cn";

// SEO & WordPress
export {
  wpURLtoNextURL,
  getUriFromWpURL,
  setSeoData,
  wpSeoToMetadata,
  seoToMetadata,
} from "./utils/seo-utils";

// Formatting
export {
  formatCurrency,
  formatCurrencyWithShorten,
  formatRelativeTime,
  formatHourString,
  getFormateVoyageDate,
} from "./utils/format-utils";

// Strings & HTML
export {
  removeAccents,
  toCamelCase,
  isEmptyString,
  countHtmlDomParser,
  getHtmlDomParser,
  removeSquareBracketsInExcerpt,
  fixFormatDescription,
} from "./utils/string-utils";

// Date & Time
export { calculateAge, calculateDuration } from "./utils/date-utils";

// Browser & Auth
export {
  isBrowser,
  getMobileOS,
  isMac,
  isJwtExpired,
} from "./utils/browser-utils";
