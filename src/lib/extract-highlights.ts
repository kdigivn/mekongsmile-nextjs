/**
 * Extract plain-text list items from WYSIWYG HTML highlights.
 * Returns first `max` items as strings. Falls back to empty array.
 */
export function extractHighlightsList(
  html: string | null | undefined,
  max: number = 3
): string[] {
  if (!html) return [];

  // Match <li> content (handles <li>text</li> and <li><p>text</p></li>)
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const items: string[] = [];

  let match;
  while ((match = liRegex.exec(html)) !== null && items.length < max) {
    // Strip inner HTML tags, trim whitespace
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text) items.push(text);
  }

  return items;
}
