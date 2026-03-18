import { ApiEndpoints } from "./endpoints";

/**
 * Build API path from endpoint. This function will check environment and build API base on that environment.
 * Environment variables using: `API_SERVER_URL` & `API_SERVER_PREFIX`
 *
 * Example:
 * - When used on Server side: `https://api.ferry-ticket.com/api/v1/bookings`
 *
 * - When used on Client side: `https://ferry-ticket.com/api/v1/bookings`
 * @param endpoint API endpoint. Example: `/v1/bookings`
 * @returns Full API path. Example:
 *
 * - Server side: `https://api.ferry-ticket.com/api/v1/bookings`
 *
 * - Client side: `https://ferry-ticket.com/api/v1/bookings`
 */
export function buildApiPath(endpoint: string) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : `${process.env.API_SERVER_URL}`;
  const apiPrefix =
    typeof window !== "undefined" ? "/api" : process.env.API_SERVER_PREFIX;

  // const url = traverse(endpoint);

  return new URL(apiPrefix + endpoint, baseUrl);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function traverse(obj: ApiEndpoints, currentPath = "") {
  const path: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      traverse(obj[key] as ApiEndpoints, currentPath + "/" + key);
    } else {
      path.push(currentPath + "/" + key);
    }
  }

  return path.join("").replace(/^\/+/, ""); // Remove leading slash if present
}
