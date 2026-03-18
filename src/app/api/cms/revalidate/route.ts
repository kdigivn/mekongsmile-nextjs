/* eslint-disable @arthurgeron/react-usememo/require-memo */
import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("graphql");
  return Response.json({ message: "Revalidate graphql" });
}
