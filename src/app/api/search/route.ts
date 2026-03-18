/* eslint-disable @arthurgeron/react-usememo/require-memo */

import { Meilisearch } from "meilisearch";
import { NextRequest, NextResponse } from "next/server";

const client = new Meilisearch({
  host: process.env.MEILISEARCH_HOST ?? "",
  apiKey: process.env.MEILISEARCH_SEARCH_KEY ?? "",
});

const index = client.index(process.env.MEILISEARCH_INDEX_NAME ?? "");
// index.updateSortableAttributes(["type"]);
//   { placeholderSearch: false, finitePagination: true }

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const filter = searchParams.get("filter");
  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await index.search(query as string, {
      filter: filter ?? "",
      // filter: "type = 'TERM'",
    });
    return NextResponse.json(results.hits);
  } catch (e) {
    console.log("Search error:", e);
    return NextResponse.json([]);
  }
}
