import { CheerioAPI, load } from "cheerio";
import {
  TableOfContent,
  TableOfContentNode,
} from "./types/table-of-content.type";
import { TableOfContentErrorEnum } from "./types/table-of-content.enum";

/**
 * Generate a function that creates unique IDs based on titles
 * @returns Function that returns a unique ID for each title
 */
const uniqueId = () => {
  const tempMap: Record<string, number> = {};
  return (el: string) => {
    if (tempMap[el]) {
      tempMap[el] += 1;
      const uniqueId = `${el}-${tempMap[el]}`;
      tempMap[uniqueId] = 1;
      return uniqueId;
    } else {
      tempMap[el] = 1;
      return el;
    }
  };
};

/**
 * Generate a sanitized ID for a heading element
 * @param $ Cheerio instance
 * @param title Element
 * @returns string Unique sanitized ID
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createId = ($: CheerioAPI, title: any): string => {
  let id = $(title).attr("id");

  if (!id) {
    id = $(title)
      .text()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/[^a-z-0-9]+/g, "")
      .replace(/^-+|-+$/g, "");
  }

  return id;
};

/**
 * Groups headings into a hierarchical tree structure based on their depth (h2, h3, etc.).
 * Handles the relationship between parent and child headings (e.g., h2 -> h3).
 *
 * @param {number} parentIndex - The index of the current parent heading.
 * @param {TableOfContentNode | undefined} parent - The parent heading node (undefined for root level).
 * @param {TableOfContentNode[]} headings - Array of all headings to process.
 * @param {number[]} prefix - Array of heading prefix. E.g: `[1,1,2] => 1.1.2 Heading text`
 * @returns {Object} - Returns the `childIndex` of the last processed child and the `children` array.
 *
 * Example input:
 * ```js
 * [
 *   { id: 'heading-1', title: 'Heading 1', depth: 2, prefix: [1] },
 *   { id: 'heading-2', title: 'Heading 2', depth: 3, prefix: [1, 1] },
 *   { id: 'heading-3', title: 'Heading 3', depth: 2, prefix: [2] },
 * ]
 * ```
 *
 * Example output:
 * ```js
 * {
 *   childIndex: 2,
 *   children: [
 *     {
 *       id: 'heading-1',
 *       title: '1 Heading 1',
 *       depth: 2,
 *       children: [
 *         { id: 'heading-2', title: '1.1 Heading 2', depth: 3 }
 *       ]
 *     },
 *     { id: 'heading-3', title: '2 Heading 3', depth: 2 }
 *   ]
 * }
 * ```
 */
const groupHeadings = (
  parentIndex = 0,
  parent: TableOfContentNode | undefined,
  headings: TableOfContentNode[],
  prefix?: number[]
): { childIndex: number; children: TableOfContentNode[] } => {
  const result: TableOfContentNode[] = []; // Store child headings for the current parent
  let firstChild: TableOfContentNode | null = null; // First valid child heading to compare depths
  let lastProcessedChildIndex = parentIndex - 1; // Keeps track of the last processed child index
  let currentPrefix = prefix ? [...prefix] : []; // Copy current prefix

  // Start iterating from parent index
  for (let i = parentIndex; i < headings.length; i++) {
    // skip if child have processed this heading
    if (i <= lastProcessedChildIndex) continue;

    const heading = headings[i];

    // parent null => root elements
    // Case 1: h2 -> h3 -> ... -> h2 -> h3.
    // Case 2: h3 -> h2 -> h3 -> ... -> h2 -> h3.
    if (!parent) {
      // set first child to first element
      if (!firstChild) {
        firstChild = heading;

        if (prefix) {
          currentPrefix = [currentPrefix.length > 0 ? currentPrefix[0] + 1 : 1]; // Increment top-level number
          heading.title = `${currentPrefix.join(".")}. ${heading.title}`;
        }

        result.push(heading);
      } else {
        // current heading depth is equal to (h3 -> h3) or less than (h3 -> h2) first child
        // -> set first child to current heading and add to result
        if (heading.depth <= firstChild.depth) {
          firstChild = heading;

          if (prefix) {
            currentPrefix = [
              currentPrefix.length > 0 ? currentPrefix[0] + 1 : 1,
            ]; // Increment top-level number
            heading.title = `${currentPrefix.join(".")}. ${heading.title}`;
          }

          result.push(heading);
        }
        // h2 -> h3
        else if (heading.depth > firstChild.depth) {
          const { childIndex, children } = groupHeadings(
            i,
            headings[i - 1],
            headings,
            prefix ? currentPrefix : undefined
          );
          lastProcessedChildIndex = childIndex;
          headings[i - 1].children = children;
        }
      }
    }
    // child elements
    else {
      // first child not set => find valid first child
      if (!firstChild) {
        // h2 -> h3 => valid
        if (heading.depth - parent.depth === 1) {
          firstChild = heading;
          if (prefix) {
            currentPrefix.push(1);
            heading.title = `${currentPrefix.join(".")} ${heading.title}`;
          }

          result.push(heading);
        }
        // h2 -> h4 => invalid
        else if (heading.depth - parent.depth > 1) {
          heading.errorCodes = [TableOfContentErrorEnum.CHILD_INVALID];

          result.push(heading);
        }
      }
      // first child set
      else {
        // h3 -> h3
        if (heading.depth === firstChild.depth) {
          if (prefix) {
            currentPrefix[currentPrefix.length - 1] += 1;
            heading.title = `${currentPrefix.join(".")} ${heading.title}`;
          }

          result.push(heading);
        }
        // h3 -> h4
        else if (heading.depth > firstChild.depth) {
          const { childIndex, children } = groupHeadings(
            i,
            headings[i - 1],
            headings,
            prefix ? currentPrefix : undefined
          );
          lastProcessedChildIndex = childIndex;
          headings[i - 1].children = children;
        }
        // h3 -> h2
        else {
          return {
            childIndex: i - 1,
            children: result,
          };
        }
      }
    }
  }

  // Return the index of the last processed heading and the grouped children
  return { childIndex: headings.length, children: result };
};

/**
 * Create a table of contents from the provided HTML content
 * @param content HTML content
 * @param options options when creating table of contents
 * @returns TableOfContent structure
 */
export const createTableOfContents = (
  content: string,
  options: { numberingPrefix: boolean } = { numberingPrefix: false }
): TableOfContent => {
  const $ = load(content ?? ""); // Load content into Cheerio
  const titles = $("h2,h3,h4,h5,h6"); // Query heading tags
  const getUniqueId = uniqueId();

  const headings: TableOfContentNode[] = Array.from(titles).map((title) => {
    const depth = parseInt(title.tagName.substring(1), 10);
    const parsedId = createId($, title);
    const uniqueId = getUniqueId(parsedId);

    $(title).attr("id", uniqueId);
    return {
      id: uniqueId,
      title: $(title).text(),
      depth,
    };
  });

  const groupedHeadings = groupHeadings(
    0,
    undefined,
    headings,
    options.numberingPrefix ? [] : undefined
  );

  return {
    toc: groupedHeadings.children,
    content: $("body").html() ?? content,
  };
};
