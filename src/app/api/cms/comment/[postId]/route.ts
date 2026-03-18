import { getCommentByPostId } from "@/services/infrastructure/wordpress/queries/getCommentByPostId";
import { getCommentByProductId } from "@/services/infrastructure/wordpress/queries/getCommentByProductId";
import { NextRequest } from "next/server";

/* eslint-disable @arthurgeron/react-usememo/require-memo */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: number } }
) {
  const { postId } = params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // Lấy query param type từ URL

  let data;

  // Xác định hàm nào cần gọi dựa vào giá trị của `type`
  if (type === "product") {
    data = await getCommentByProductId({ productId: postId });
  } else if (type === "post") {
    data = await getCommentByPostId({ postId });
  } else {
    return Response.json(
      { message: "Invalid type. Expected 'product' or 'post'." },
      { status: 400 }
    );
  }

  // Kiểm tra nếu không có dữ liệu
  if (!data) {
    return Response.json(
      { message: "Failed to get comment list of specific post/product" },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 200 });
}
