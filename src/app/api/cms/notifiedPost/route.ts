import { getNotifiedPosts } from "@/services/infrastructure/wordpress/queries/getPosts";

/* eslint-disable @arthurgeron/react-usememo/require-memo */
export async function GET() {
  const data = await getNotifiedPosts();

  if (!data) {
    return Response.json(
      { message: "Failed to get Notified Posts" },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 200 });
}
