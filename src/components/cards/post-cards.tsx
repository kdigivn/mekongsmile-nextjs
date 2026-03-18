import { Post } from "@/services/infrastructure/wordpress/types/post";
import { memo } from "react";
import { badgeVariants } from "../ui/badge";
import { format } from "date-fns";
import LinkBase from "../link-base";
import { Product } from "@/services/infrastructure/wordpress/types/product";
import { cn, removeSquareBracketsInExcerpt } from "@/lib/utils";
import { CiCalendar } from "react-icons/ci";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";

type Props = {
  post: Post | Product;
  numberItemPerRow?: number;
  colSpan?: string;
  priority?: boolean;
};
function isProduct(post: Post | Product): post is Product {
  return (post as Product).productId !== undefined;
}

const PostCard = ({
  post,
  numberItemPerRow = 4,
  colSpan = ` col-span-12 md:col-span-4 lg:col-span-${Math.ceil(12 / numberItemPerRow)}`,
  priority = false,
}: Props) => {
  const preSlug = isProduct(post) ? "/product" : "";
  return (
    <div
      className={cn(
        `group flex cursor-pointer flex-col overflow-hidden rounded-lg border-1 border-white bg-white duration-200 ease-in-out hover:shadow-cardHover ${colSpan} `
      )}
    >
      <LinkBase
        href={`${preSlug}/${post?.slug}`}
        className="block h-full w-full"
      >
        <Image
          src={
            post?.featuredImage?.node.sourceUrl
              ? post?.featuredImage?.node.sourceUrl
              : "/static-img/placeholder-image-700x394.png"
          }
          alt={post?.title}
          height={220}
          width={367}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          className="aspect-video w-full !rounded-none object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          quality={75}
          unoptimized
        />
      </LinkBase>
      <div className="flex w-full flex-col gap-2 px-[10px] pb-3 pt-2">
        {/* <div className="text-xs font-bold text-danger">HOT HOT HOT</div> */}
        <h3 className="line-clamp-2 h-10 text-ellipsis break-words text-sm font-semibold text-black transition-all duration-200 ease-in-out group-hover:text-primary md:h-12 md:text-base">
          <LinkBase href={`${preSlug}/${post?.slug}`}>{post?.title}</LinkBase>
        </h3>
        <div
          className="line-clamp-3 h-10 text-sm font-normal text-black md:line-clamp-2"
          dangerouslySetInnerHTML={{
            __html: removeSquareBracketsInExcerpt(post?.excerpt ?? ""),
          }}
        />

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex h-6 gap-1 text-xs font-bold">
            {post?.tags?.nodes?.map((tag) => (
              <LinkBase
                href={tag.uri ?? "#"}
                key={tag.tagId}
                className={
                  badgeVariants({ variant: "card" }) +
                  ` border-1 border-default-50 transition-colors duration-200 ease-in-out hover:border-primary`
                }
              >
                {tag.name}
              </LinkBase>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex items-center gap-2">
          <CiCalendar className="h-5 w-5" />
          <div className="text-sm">{format(post?.date, "dd/MM/yyyy")}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(PostCard);
