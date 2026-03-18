/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Path to the generated sitemap.xml file
const sitemapPaths = [
  path.join(__dirname, "public", "sitemap.xml"),
  path.join(__dirname, "public", "sitemap-0.xml"),
  path.join(__dirname, ".next/server/app/sitemap", "categories.xml.body"),
  path.join(__dirname, ".next/server/app/sitemap", "pages.xml.body"),
  path.join(__dirname, ".next/server/app/sitemap", "posts.xml.body"),
  path.join(__dirname, ".next/server/app/sitemap", "products.xml.body"),
  path.join(__dirname, ".next/server/app/sitemap", "terms.xml.body"),
  path.join(__dirname, ".next/server/app/sitemap", "tags.xml.body"),
];

// Text or comment to add after the XML declaration
const customText = `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl" ?>`;

sitemapPaths.forEach((sitemapPath) => {
  fs.readFile(sitemapPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading sitemap.xml:", err);
      return;
    }

    // Find the position right after the XML declaration
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    const position = data.indexOf(xmlDeclaration) + xmlDeclaration.length;

    // Insert the custom text right after the XML declaration
    const updatedSitemap =
      data.slice(0, position) + "\n" + customText + data.slice(position);

    // Write the updated content back to the sitemap.xml file
    fs.writeFile(sitemapPath, updatedSitemap, "utf8", (err) => {
      if (err) {
        console.error(`Error writing ${sitemapPath} :`, err);
        return;
      }
    });
  });
});

console.log(`Custom style added to sitemap.xml successfully.`);
