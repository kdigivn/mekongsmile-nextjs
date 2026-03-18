/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { getNotFoundImage } from "@/services/infrastructure/wordpress/queries/getBlockCustom";

export async function GET() {
  const data = await getNotFoundImage();

  if (!data) {
    return Response.json(
      { message: "Failed to get Notified Posts" },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 200 });
}
