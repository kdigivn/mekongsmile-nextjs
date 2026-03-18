"use client";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import React, { memo } from "react";
import { IoIosLink } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import { toast } from "sonner";
import Image from "next/image";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { Link } from "@heroui/react";
import { useTranslation } from "@/services/i18n/client";
import { usePathname } from "next/navigation";

const SocialSharing = ({
  className,
  post,
}: {
  className?: string;
  post: Post | Product;
}) => {
  const { t } = useTranslation("common");
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const pathname = usePathname();

  const currentUrl = process.env.NEXT_PUBLIC_BASE_URL + pathname;

  return (
    <div className={`flex gap-3 ${className}`}>
      {currentUrl && (
        <>
          {/* Facebook Sharing */}
          <Link
            href={`https://www.facebook.com/sharer.php?u=${currentUrl}`}
            target="_blank"
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
          >
            <Image
              // src="https://r2.kdigi.net/ferry-ticket/public/Facebook_Logo_2023.png"
              src={"/static-img/logo-facebook.svg"}
              alt="facebook sharing"
              width={20}
              height={20}
              className=""
            />
          </Link>

          {/* X (formerly Twitter) Sharing */}
          <Link
            href={`https://x.com/intent/tweet?url=${currentUrl}&text=${post.title}`}
            target="_blank"
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
          >
            <Image
              src={"/static-img/logo-twitterx.svg"}
              alt="X sharing"
              width={20}
              height={20}
              className=""
            />
          </Link>

          {/* Email Sharing */}
          <Link
            href={`mailto:?subject=Check this out&body=${currentUrl} ${post.title}`}
            target="_blank"
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
          >
            <Image
              src="/static-img/email.svg"
              alt="email sharing"
              width={20}
              height={20}
              className=""
            />
          </Link>

          {/* LinkedIn Sharing */}
          <Link
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}&title=${post.title}`}
            target="_blank"
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
          >
            <Image
              src="/static-img/logo-linkedin.svg"
              alt="linkedin sharing"
              width={20}
              height={20}
              className=""
            />
          </Link>

          {/* Telegram Sharing */}
          <Link
            href={`https://t.me/share/url?url=${currentUrl}&text=${post.title}`}
            target="_blank"
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
          >
            <Image
              src="/static-img/logo-telegram.svg"
              alt="telegram sharing"
              width={20}
              height={20}
              className=""
            />
          </Link>

          {/* Copy Link Button */}
          <button
            key={1}
            onClick={() => {
              copyToClipboard(currentUrl);
              toast.success(t("social-sharing.copied-link"));
            }}
            className="grayscale transition-all duration-200 ease-in-out hover:grayscale-0"
            aria-label="Copy post link"
          >
            {isCopied ? <IoCheckmark size={20} /> : <IoIosLink size={20} />}
            <div className="w-full flex-1 rounded-md bg-[--bg] md:rounded-lg" />
          </button>
        </>
      )}
    </div>
  );
};

export default memo(SocialSharing);
