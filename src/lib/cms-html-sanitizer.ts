import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes CMS HTML content (WordPress) before rendering with dangerouslySetInnerHTML.
 * Allows common formatting tags but strips scripts, iframes, and event handlers.
 */
export function sanitizeCmsHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "picture",
      "source",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "iframe", // Allow iframes for YouTube embeds but with restricted attributes
      "col",
      "colgroup",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: [
        "src",
        "srcset",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "class",
        "style",
      ],
      a: ["href", "name", "target", "rel", "class"],
      iframe: [
        "src",
        "width",
        "height",
        "frameborder",
        "allowfullscreen",
        "title",
      ],
      // WordPress table plugins (TablePress, WP DataTables) use these attributes
      table: [
        "border",
        "cellpadding",
        "cellspacing",
        "width",
        "height",
        "align",
        "summary",
      ],
      td: ["colspan", "rowspan", "width", "height", "align", "valign"],
      th: ["colspan", "rowspan", "width", "height", "align", "valign", "scope"],
      tr: ["align", "valign"],
      col: ["span", "width"],
      colgroup: ["span", "width"],
      "*": ["class", "id", "style"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "player.vimeo.com",
      "www.google.com",
    ],
  });
}
