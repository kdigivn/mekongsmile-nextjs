import { wpURLtoNextURL } from "@/lib/utils";
import { WordpressPage } from "../../wordpress/types/page";
import { getServerSideMeilisearchClient } from "../meilisearch-client";
import { SearchContentType, SearchDocument } from "../meilisearch.type";
import { extractContentsFromHtml, WPIdToMeilisearchId } from "../utils";
import { Post } from "../../wordpress/types/post";
import { Term } from "../../wordpress/types/term";
import { Product } from "../../wordpress/types/product";

// Document buffer — batches Meilisearch writes to avoid flooding HTTP connections during SSG
const FLUSH_THRESHOLD = 200;
const documentBuffer: SearchDocument[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Flush buffered documents to Meilisearch in a single batch call */
async function flushBuffer() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (documentBuffer.length === 0) return;

  const docs = documentBuffer.splice(0);
  try {
    const client = await getServerSideMeilisearchClient();
    console.log(`[meilisearch] flushing ${docs.length} documents`);
    await client.addDocuments(docs, { primaryKey: "id" });
  } catch (e) {
    console.error("[meilisearch] batch write failed, re-queuing docs:", e);
    documentBuffer.unshift(...docs);
  }
}

// Ensure remaining docs are flushed before Node.js exits (handles .unref() timer gap)
if (typeof process !== "undefined") {
  // beforeExit fires when event loop empties — attempt async flush
  process.on("beforeExit", () => {
    if (documentBuffer.length > 0) {
      flushBuffer().catch((e) =>
        console.error("[meilisearch] beforeExit flush error:", e)
      );
    }
  });

  // exit fires on process.exit() — sync only, cannot flush, but warn about lost docs
  process.on("exit", () => {
    if (documentBuffer.length > 0) {
      console.warn(
        `[meilisearch] WARNING: ${documentBuffer.length} documents lost — process exited before flush completed`
      );
    }
  });
}

/** Queue documents for batched indexing — flushes every 200 docs or after 1s idle */
function queueDocuments(docs: SearchDocument[]) {
  documentBuffer.push(...docs);

  if (documentBuffer.length >= FLUSH_THRESHOLD) {
    flushBuffer().catch((e) => console.error("[meilisearch] flush error:", e));
  } else {
    // Auto-flush after 1s of inactivity (catches remaining docs after last page)
    // .unref() prevents this timer from keeping Node.js alive during build
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushBuffer, 1000);
    flushTimer.unref();
  }
}

export function serverAddWordpressPage(page: WordpressPage) {
  // Only indexing on production environment
  if (process.env.NODE_ENV !== "production") return;

  const searchDocuments: SearchDocument[] = [];

  if (page.content) {
    const contents = extractContentsFromHtml(page.content);

    searchDocuments.push(
      ...contents.map((content, idx) => ({
        parent_id: page.id,
        id: `${WPIdToMeilisearchId(page.id)}-${idx}`,
        title: page.title,
        type: SearchContentType.PAGE,
        url: wpURLtoNextURL(page.uri),
        content: content,
        createdAt: new Date(page.date),
      }))
    );
  } else {
    searchDocuments.push({
      id: WPIdToMeilisearchId(page.id),
      title: page.title,
      type: SearchContentType.PAGE,
      url: wpURLtoNextURL(page.uri),
      createdAt: new Date(page.date),
    });
  }

  console.log(`searchPage: ${page.title}: ${searchDocuments.length} sentences`);
  if (searchDocuments.length) {
    queueDocuments(searchDocuments);
  }
}

export function serverAddWordpressPost(post: Post) {
  // Only indexing on production environment
  if (process.env.NODE_ENV !== "production") return;

  const searchDocuments: SearchDocument[] = [];

  if (post.content) {
    const contents = extractContentsFromHtml(post.content);

    searchDocuments.push(
      ...contents.map((pageContent, idx) => ({
        parent_id: post.id,
        id: `${WPIdToMeilisearchId(post.id)}-${idx}`,
        title: post.title,
        type: SearchContentType.POST,
        url: wpURLtoNextURL(post.uri),
        thumbnailUrl: post.featuredImage?.node.sourceUrl,
        content: pageContent,
        createdAt: new Date(post.date),
      }))
    );
  } else {
    searchDocuments.push({
      id: WPIdToMeilisearchId(post.id),
      title: post.title,
      type: SearchContentType.POST,
      url: wpURLtoNextURL(post.uri),
      thumbnailUrl: post.featuredImage?.node.sourceUrl,
      createdAt: new Date(post.date),
    });
  }
  console.log(`searchPost: ${post.title}: ${searchDocuments.length} sentences`);

  if (searchDocuments.length) {
    queueDocuments(searchDocuments);
  }
}

export function serverAddWordpressTerm(term: Term) {
  // Only indexing on production environment
  if (process.env.NODE_ENV !== "production") return;

  const searchDocuments: SearchDocument[] = [
    {
      id: WPIdToMeilisearchId(term.id),
      title: term.name,
      type: SearchContentType.TERM,
      url: wpURLtoNextURL(term.uri),
    },
  ];

  console.log(`searchTerm: ${term.name}: ${searchDocuments.length} sentences`);

  queueDocuments(searchDocuments);
}

export function serverAddWordpressProduct(product: Product) {
  // Only indexing on production environment
  if (process.env.NODE_ENV !== "production") return;

  const searchDocuments: SearchDocument[] = [];

  if (product.content) {
    const contents = extractContentsFromHtml(product.content);

    searchDocuments.push(
      ...contents.map((pageContent, idx) => ({
        parent_id: product.id,
        id: `${WPIdToMeilisearchId(product.id)}-${idx}`,
        title: product.title,
        type: SearchContentType.PRODUCT,
        url: wpURLtoNextURL(product.uri),
        thumbnailUrl: product.featuredImage.node.sourceUrl,
        content: pageContent,
        createdAt: new Date(product.date),
      }))
    );
  } else {
    searchDocuments.push({
      id: WPIdToMeilisearchId(product.id),
      title: product.title,
      type: SearchContentType.PRODUCT,
      url: wpURLtoNextURL(product.uri),
      thumbnailUrl: product.featuredImage.node.sourceUrl,
      createdAt: new Date(product.date),
    });
  }

  console.log(
    `searchProduct: ${product.title}: ${searchDocuments.length} sentences`
  );

  if (searchDocuments.length) {
    queueDocuments(searchDocuments);
  }
}
