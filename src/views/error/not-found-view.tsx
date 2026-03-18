"use client";

import { Image, Link } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

function NotFoundView() {
  return (
    <div className="flex h-svh min-h-screen items-center justify-center rounded-lg bg-white">
      <div className="flex h-full max-w-96 flex-col items-center justify-center gap-4 text-center">
        <Image
          src={"/static-img/404-img.svg"}
          alt="Page not found"
          height={200}
          width={200}
          loading="lazy"
          className="h-60 w-60 !rounded-none object-cover"
        />
        <h2 className="text-2xl font-semibold">
          <span className="text-primary">404</span> Page Not Found
        </h2>
        <p className="text-sm font-normal">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
        </p>
        <Button
          asChild
          className="h-9 text-sm font-semibold sm:h-10 md:text-base lg:h-12"
        >
          <Link href="/">Trở về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}

export default memo(NotFoundView);
