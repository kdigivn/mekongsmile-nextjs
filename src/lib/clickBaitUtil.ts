import { Voyage } from "@/services/apis/voyages/types/voyage";

/**
 * ClickBait Configuration Type
 * Defines routes and dates that should trigger clickbait voyages
 */
export type ClickBaitConfig = {
  routeId: number;
  departureDates: string[]; // Format: "YYYY-MM-DD"
};

/**
 * ClickBait Data Type
 * Data attached to clickbait voyages
 */
export type ClickBaitData = {
  price: number; // Promotional price (default: 0 for free, can be customized per campaign)
  rootVoyageId: string; // Original voyage ID to navigate back to
};

/**
 * Clickbait Campaign Configurations
 *
 * @param routeId - Route ID to trigger clickbait
 * @param departureDates - List of departure dates (YYYY-MM-DD format)
 * @param promoPrice - Promotional price (default: 0 = free)
 */
export const CLICKBAIT_CONFIGS: (ClickBaitConfig & { promoPrice?: number })[] =
  [
    {
      routeId: 6, // tran-de-con-dao
      departureDates: ["2026-03-24", "2026-03-25", "2026-03-26"],
      promoPrice: 0,
    },
    {
      routeId: 7, // con-dao-tran-de
      departureDates: ["2026-03-24", "2026-03-25", "2026-03-26"],
      promoPrice: 0,
    },
    {
      routeId: 22, // soc-trang-con-dao
      departureDates: ["2026-03-24", "2026-03-25", "2026-03-26"],
      promoPrice: 0,
    },
    {
      routeId: 23, // soc-trang-con-dao
      departureDates: ["2026-03-24", "2026-03-25", "2026-03-26"],
      promoPrice: 0,
    },
  ];

/**
 * Fixed voucher code to compensate when promotion expires
 */
export const CLICKBAIT_VOUCHER_CODE = "XINCHAO";

/**
 * Suffix to mark voyage ID as clickbait
 */
export const CLICKBAIT_SUFFIX = "-CB";

/**
 * LocalStorage key to store blocked root voyage IDs
 */
const BLOCKED_VOYAGES_KEY = "clickbait_blocked_voyages";

/**
 * SessionStorage key prefix to cache selected clickbait voyage per route+date
 * Format: "clickbait_cache_{routeId}_{date}"
 */
const CLICKBAIT_CACHE_PREFIX = "clickbait_cache";

/**
 * Check if this route + date should show clickbait voyage
 */
export const shouldShowClickbait = (
  routeId: number,
  departureDate: string
): boolean => {
  return CLICKBAIT_CONFIGS.some(
    (config) =>
      config.routeId === routeId &&
      config.departureDates.includes(departureDate)
  );
};

/**
 * Get cache key for route + date combination
 */
const getClickbaitCacheKey = (
  routeId: number,
  departureDate: string
): string => {
  return `${CLICKBAIT_CACHE_PREFIX}_${routeId}_${departureDate}`;
};

/**
 * Get cached clickbait voyage ID for this route + date
 */
const getCachedClickbaitVoyageId = (
  routeId: number,
  departureDate: string
): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const key = getClickbaitCacheKey(routeId, departureDate);
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error("Error reading clickbait cache:", error);
    return null;
  }
};

/**
 * Cache clickbait voyage ID for this route + date
 */
const cacheClickbaitVoyageId = (
  routeId: number,
  departureDate: string,
  voyageId: string
): void => {
  if (typeof window === "undefined") return;

  try {
    const key = getClickbaitCacheKey(routeId, departureDate);
    sessionStorage.setItem(key, voyageId);
  } catch (error) {
    console.error("Error caching clickbait voyage:", error);
  }
};

/**
 * Generate a clickbait voyage by cloning a random valid voyage with promotional pricing
 * Uses sessionStorage to cache the selected voyage for consistency within the session
 * Only clones from voyages that haven't been blocked
 */
export const generateClickbaitVoyage = (
  voyages: Voyage[],
  routeId: number,
  departureDate: string
): Voyage | null => {
  // Find config for this route + date
  const config = CLICKBAIT_CONFIGS.find(
    (c) => c.routeId === routeId && c.departureDates.includes(departureDate)
  );

  // Return null if no clickbait needed
  if (!config) {
    return null;
  }

  // Get promotional price from config (default: 0 = free)
  const promoPrice = config.promoPrice ?? 0;

  // Get list of blocked voyages
  const blockedVoyages = getBlockedRootVoyages();

  // Filter valid voyages that haven't been blocked
  const validVoyages = voyages.filter(
    (v) =>
      !v.disable &&
      v.no_remain > 0 &&
      !blockedVoyages.includes(v.id) &&
      !v.clickBait // Don't clone from existing clickbait voyages
  );

  if (validVoyages.length === 0) {
    return null;
  }

  // Try to get cached voyage ID first
  const cachedVoyageId = getCachedClickbaitVoyageId(routeId, departureDate);
  let rootVoyage: Voyage | undefined;

  if (cachedVoyageId) {
    // Find the cached voyage in current valid voyages
    rootVoyage = validVoyages.find((v) => v.id === cachedVoyageId);
  }

  // If cached voyage not found or doesn't exist, select a new one randomly
  if (!rootVoyage) {
    const randomIndex = Math.floor(Math.random() * validVoyages.length);
    rootVoyage = validVoyages[randomIndex];

    // Cache this selection for consistency
    cacheClickbaitVoyageId(routeId, departureDate, rootVoyage.id);
  }

  // Clone voyage with promotional price
  const clickbaitVoyage: Voyage = {
    ...rootVoyage,
    // Temporary ID for distinction (will be replaced with rootVoyageId-CB on navigation)
    id: `${rootVoyage.id}${CLICKBAIT_SUFFIX}`,
    ticket_prices: {
      ...rootVoyage.ticket_prices,
      default_ticket_price: promoPrice, // Use price from config
    },
    clickBait: {
      price: promoPrice, // Store promotional price
      rootVoyageId: rootVoyage.id,
    },
  };

  return clickbaitVoyage;
};

/**
 * Check if voyage ID is a clickbait voyage (has -CB suffix)
 */
export const isClickbaitVoyageId = (voyageId: string): boolean => {
  return voyageId.endsWith(CLICKBAIT_SUFFIX);
};

/**
 * Extract root voyage ID from clickbait ID
 * Example: "voyage123-CB" => "voyage123"
 */
export const getRootVoyageId = (clickbaitId: string): string => {
  return clickbaitId.replace(CLICKBAIT_SUFFIX, "");
};

/**
 * Add clickbait suffix to voyage ID
 * Example: "voyage123" => "voyage123-CB"
 */
export const addClickbaitSuffix = (voyageId: string): string => {
  return `${voyageId}${CLICKBAIT_SUFFIX}`;
};

/**
 * Get list of blocked root voyage IDs (already shown popup)
 * Users won't see clickbait from these voyages again
 */
export const getBlockedRootVoyages = (): string[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(BLOCKED_VOYAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading blocked voyages from localStorage:", error);
    return [];
  }
};

/**
 * Add root voyage to blocked list
 * Call this after user has seen the "Promotion Expired" popup
 */
export const addBlockedRootVoyage = (rootVoyageId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const blocked = getBlockedRootVoyages();

    // Only add if not already exists
    if (!blocked.includes(rootVoyageId)) {
      blocked.push(rootVoyageId);
      localStorage.setItem(BLOCKED_VOYAGES_KEY, JSON.stringify(blocked));
    }
  } catch (error) {
    console.error("Error saving blocked voyage to localStorage:", error);
  }
};

/**
 * Clear entire blocked voyages list
 * Use for testing or campaign reset
 */
export const clearBlockedVoyages = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(BLOCKED_VOYAGES_KEY);
  } catch (error) {
    console.error("Error clearing blocked voyages from localStorage:", error);
  }
};
