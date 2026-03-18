import HeadingBase from "@/components/heading/heading-base";
import LinkBase from "@/components/link-base";
import { ImageLinkTypeItem } from "@/services/infrastructure/wordpress/types/sideBar";
import Image from "next/image";

type Props = {
  operatorImgs: ImageLinkTypeItem[];
};

async function CoopSection({ operatorImgs }: Props) {
  const shuffleSize = 18;

  while (operatorImgs.length < shuffleSize) {
    operatorImgs.forEach((item) => {
      if (operatorImgs.length >= shuffleSize) return;
      operatorImgs.push(item);
    });
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 lg:overflow-hidden">
      <HeadingBase headingTag="h2">{`Đồng hành cùng chúng tôi`}</HeadingBase>

      <div className="flex w-screen justify-center overflow-hidden lg:w-full">
        <div className="relative flex py-5">
          <div
            className={`flex w-max animate-marquee overflow-hidden [--duration:25s] hover:[animation-play-state:paused]`}
          >
            {operatorImgs.map((item, index) => (
              <div key={index} className="h-full cursor-pointer px-2.5">
                <div className="flex h-[128px] w-[190px] items-center rounded-md bg-white p-2">
                  <LinkBase
                    href={item?.image_link ?? "#"}
                    aria-label={`Link to ${item?.partnerImg.node.title ?? "partner"}`}
                  >
                    <Image
                      src={
                        item?.partnerImg.node.sourceUrl ??
                        "/static-img/placeholder-partnership.jpg"
                      }
                      alt={item?.partnerImg.node.altText ?? ""}
                      loading="lazy"
                      className="aspect-video object-contain"
                      height={128}
                      width={190}
                      unoptimized
                    />
                  </LinkBase>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoopSection;
