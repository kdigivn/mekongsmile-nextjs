import { NotFoundView } from "@/views/error";
import { Metadata } from "next";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Không tìm thấy trang | 404 Page Not Found",
  description: "Xin lỗi, trang bạn đang tìm kiếm không tồn tại.",
  robots: "noindex",
  openGraph: {
    title: "Không tìm thấy trang | 404 Page Not Found",
    description: "Xin lỗi, trang bạn đang tìm kiếm không tồn tại.",
    type: "website",
  },
};

function NotFound() {
  return <NotFoundView />;
}
export default NotFound;
