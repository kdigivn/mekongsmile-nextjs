/**
 * Safely serialize JSON-LD string from WordPress Rank Math.
 * Parses and re-serializes to prevent XSS injection via raw HTML in JSON-LD.
 */
export function safeJsonLd(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  } catch {
    // Invalid JSON — do not render
    return null;
  }
}
