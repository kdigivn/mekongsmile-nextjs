import { memo, useEffect, useRef, useState } from "react";
import HeadingBase from "../heading/heading-base";
import TableOfContentItem from "./TableOfContentItem";
import { TableOfContentNode } from "./types/table-of-content.type";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { useCheckMobile } from "@/hooks/use-check-screen-type";
import { IoIosList } from "react-icons/io";
import { useTranslation } from "@/services/i18n/client";

type Props = {
  toc: TableOfContentNode[];
  style?: {
    /**
     * Wrapper class name
     */
    className?: string;
    /**
     * Title class name.
     */
    titleClassName?: string;
    /**
     * Class name of content section
     */
    contentClassName?: string;
    /**
     * Item class name
     */
    itemClassName?: string;
    /**
     * active item class name
     */
    activeItemClassName?: string;
  };
  titleText?: string;
  activeId?: string;
  depth: number;
  onItemClicked?: () => void;
};

/**
 * A Table of Content component
 * @param {Object} props
 * @param {Object} props.toc Table of Content object
 * @param {Object} props.style Class name for this component
 * @param {string} props.style.className Wrapper class name
 *
 * Default: `my-5 p-3`
 * @param {string} props.style.titleClassName Title class name.
 *
 * Default: `text-xl font-semibold`
 * @param {string} props.style.contentClassName Class name of content section
 * @param {string} props.style.itemClassName Item class name
 * @param {string} props.style.activeItemClassName active item class name
 * @param {string} props.titleText Title text
 * @param {string} props.activeId Active ID
 * @param {number} props.depth Max display depth based on heading level. From 2-6.
 *
 * Default value is 6.
 * @param {()=>{}} props.onItemClicked Handler when an item is clicked
 * @returns
 */
const TableOfContent = ({
  toc,
  style,
  titleText,
  activeId,
  depth = 6,
  onItemClicked,
}: Props) => {
  const defaultStyle = {
    className: "my-5 p-3 overflow-auto ",
    titleClassName: "text-xl font-semibold",
    contentClassName: "",
    itemClassName: "",
    activeItemClassName: "text-primary",
  };

  // Merge input style with default style
  style = { ...defaultStyle, ...style };

  const scrollRef = useRef(null);

  // const scroll = useCallback(
  //   (to) => {
  //     scrollRef.current?.scrollTo({
  //       top: to - scrollRef.current.offsetTop,
  //       behavior: 'smooth',
  //     });
  //   },
  //   [scrollRef]
  // );
  const isDesktop = !useCheckMobile();
  const { t } = useTranslation("table-of-content");
  const [isOpen, setIsOpen] = useState(false);

  // TODO: re-add mobile nav hide/show when bottom nav is rebuilt

  if (isDesktop) {
    return (
      <div className={`${style.className ?? ""} `}>
        <Accordion type="single" defaultValue="title" collapsible>
          <AccordionItem value="title" className="border-none">
            <AccordionTrigger className="hover:no-underline" isHeader={false}>
              <HeadingBase headingTag="p" contentClass="text-lg">
                {titleText ? titleText : t("title")}
              </HeadingBase>
            </AccordionTrigger>
            <AccordionContent>
              <div ref={scrollRef} className={`${style?.contentClassName}`}>
                <ul>
                  {toc.map((item) => (
                    <li key={item.id} className="mb-2 flex flex-col last:mb-0">
                      <TableOfContentItem
                        className={style?.itemClassName}
                        activeClassName={style?.activeItemClassName}
                        activeId={activeId}
                        tocItem={item}
                        currentDepth={2}
                        depth={depth}
                        onClick={onItemClicked}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  } else {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          asChild
          className="fixed right-0 top-1/2 z-50 h-fit w-fit -translate-x-1/2 -translate-y-3/4 transform"
        >
          <Button
            className="z-50 h-9 w-9 rounded-lg bg-primary-100 p-2"
            aria-label="Open menu" // Descriptive label for screen readers
          >
            <IoIosList className="h-6 w-6 text-primary-800" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <div className="flex w-full">
                <HeadingBase headingTag="p" contentClass="text-xl">
                  {titleText ? titleText : t("title")}
                </HeadingBase>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div ref={scrollRef} className={`${style?.contentClassName}`}>
            <ul>
              {toc.map((item) => (
                <li key={item.id} className="mb-2 flex flex-col last:mb-0">
                  <TableOfContentItem
                    className={style?.itemClassName}
                    activeClassName={style?.activeItemClassName}
                    activeId={activeId}
                    tocItem={item}
                    currentDepth={2}
                    depth={depth}
                    onClick={onItemClicked}
                  />
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
};

export default memo(TableOfContent);
