/* eslint-disable @arthurgeron/react-usememo/require-memo */

import { load } from "cheerio";

/**
 * Convert Wordpress ID to Meilisearch valid ID: alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_).
 * @param {string} id input ID
 * @returns
 */
export const WPIdToMeilisearchId = (id: string) => {
  return id.replace(/[^a-zA-Z0-9-_]/g, "_");
};

/**
 * Extract content from html string
 * @param htmlString Content in HTML format
 * @returns array of contents in HTML tags
 */
export const extractContentsFromHtml = (htmlString: string): string[] => {
  if (!htmlString) {
    throw new Error("ExtractContentsFromHtml Error: HTML string cannot empty!");
  }

  const $ = load(htmlString); // Load the HTML string with Cheerio
  const contentArray: string[] = [];

  // Iterate over each element and extract the text content
  $("body")
    .children()
    .each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        contentArray.push(text);
      }
    });

  return contentArray;
};
