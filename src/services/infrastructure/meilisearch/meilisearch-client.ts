import { Index, Meilisearch } from "meilisearch";

// Singleton cache — avoids repeated getIndexes() HTTP calls during SSG build
let cachedServerIndex: Index | null = null;

/**
 * Validate requirement environment variables for Meilisearch
 * @param mode environment mode
 * @returns
 */
const validateRequiredEnvVariables = (mode: "server" | "client" = "client") => {
  let isValid = true;
  const errors: string[] = [];

  const host = process.env.MEILISEARCH_HOST ?? "";
  if (!host) {
    isValid = false;
    errors.push(`Environment variable MEILISEARCH_HOST is missing`);
  }

  const indexUid = process.env.MEILISEARCH_INDEX_NAME ?? "";
  if (!indexUid) {
    isValid = false;
    errors.push(`Environment variable MEILISEARCH_INDEX_NAME is missing`);
  }

  let apiKey = "";
  if (mode === "server") {
    apiKey = process.env.MEILISEARCH_ADMIN_KEY ?? "";
    if (!apiKey) {
      isValid = false;
      errors.push(`Environment variable MEILISEARCH_ADMIN_KEY is missing`);
    }
  }

  if (mode === "client") {
    apiKey = process.env.MEILISEARCH_SEARCH_KEY ?? "";
    if (!apiKey) {
      isValid = false;
      errors.push(`Environment variable MEILISEARCH_SEARCH_KEY is missing`);
    }
  }

  return {
    host,
    apiKey,
    indexUid,
    isValid,
    errors,
  };
};
/**
 * Init meilisearch client for server-side
 * @returns an index object of meilisearch to perform operations with that index
 */
export const getServerSideMeilisearchClient = async () => {
  if (cachedServerIndex) return cachedServerIndex;

  const { host, indexUid, apiKey, isValid, errors } =
    validateRequiredEnvVariables("server");

  if (!isValid) {
    throw new Error("Meilisearch Errors: \n" + errors.join("\n").toString());
  }

  const client = new Meilisearch({ host, apiKey });

  // Check & init index
  const indexes = await client.getIndexes();
  const index = indexes.results.find((index) => index.uid === indexUid);

  if (index) {
    cachedServerIndex = index;
    return index;
  }

  // Index not exist => Create and set up an index
  await client.createIndex(indexUid, { primaryKey: "id" });

  const newIndex = client.index(indexUid);
  await newIndex.updateSettings({
    distinctAttribute: "parent_id", // read `SearchDocument` type for more detail
    searchableAttributes: ["title", "url", "content"],
    filterableAttributes: ["type"],
  });

  cachedServerIndex = newIndex;
  return newIndex;
};

/**
 * Init meilisearch client for client-side
 * @returns an index object of meilisearch to perform operations with that index
 */
export const getClientSideMeilisearchClient = async () => {
  if (typeof window === "undefined") {
    throw new Error(
      "Meilisearch Client: Only use this function on client side!"
    );
  }

  const { host, indexUid, apiKey, isValid, errors } =
    validateRequiredEnvVariables("client");

  if (!isValid) {
    throw new Error("Meilisearch Errors: \n" + errors.join("\n").toString());
  }

  const client = new Meilisearch({ host, apiKey });

  // Check & init index
  const indexes = await client.getIndexes();
  const index = indexes.results.find((index) => index.uid === indexUid);

  if (!index) {
    throw new Error(
      "Index " +
        indexUid +
        " not exist! You can init this index using `getServerSideMeilisearchClient` function"
    );
  }

  return index;
};
