import { memo, useCallback, useMemo, useRef, useState } from "react";
import { TableOfContentNode } from "./types/table-of-content.type";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useTranslation } from "@/services/i18n/client";

type Props = {
  activeId?: string;
  tocItem: TableOfContentNode;
  className?: string;
  activeClassName?: string;
  currentDepth: number;
  depth: number;
  onClick?: () => void;
  scrollToActiveItem?: (offset: number) => void;
};
/**
 * A Table of Content Item component
 * @param {Object} props
 * @param {Object} props.tocItem Toc Item
 * @param {string} props.tocItem.id
 * @param {string} props.tocItem.title
 * @param {Object[]} props.tocItem.children
 * @param {string} props.tocItem.errorCode
 * @param {string} props.activeId ID of active heading
 * @param {string} props.className
 * @param {string} props.activeClassName
 * @param {number} props.currentDepth Depth of current item
 * @param {number} props.depth Max render depth. From 2-6.
 *
 * Default value is 6.
 * @param {(scrollTo)=>{}} props.scrollToActiveItem Callback to scroll active heading to the top of scroll container
 * @param {()=>{}} props.onClick Handler for mouse click event
 * @returns
 */
const TableOfContentItem = ({
  activeId,
  tocItem,
  className,
  activeClassName,
  currentDepth,
  depth = 6,
  // scrollToActiveItem = () => {},
  onClick = () => {},
}: Props) => {
  const { t } = useTranslation("table-of-content");
  const { id, title, children, errorCodes } = tocItem;
  const itemRef = useRef(null);

  // useEffect(() => {
  //   if (activeId === id && itemRef.current) {
  //     scrollToActiveItem(itemRef.current.offsetTop);
  //   }
  // }, [activeId, itemRef, id, scrollToActiveItem]);

  const startContent = useMemo(
    () => (
      <a
        ref={itemRef}
        href={`#${id}`}
        className={cn(
          className,
          activeId === id && activeClassName,
          (children?.length ?? 0) > 0 && currentDepth <= depth ? "pb-0" : ""
        )}
        onClick={onClick}
      >
        {title}
      </a>
    ),
    [
      activeClassName,
      activeId,
      children?.length,
      className,
      currentDepth,
      depth,
      id,
      onClick,
      title,
    ]
  );

  const findById = useCallback(
    (item: TableOfContentNode, id: string | undefined): boolean => {
      if (id) {
        if (item.id === id) {
          return true;
        }
        if (Array.isArray(item.children)) {
          for (const child of item.children) {
            if (findById(child, id)) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const [expandItem, setExpandItem] = useState<string[]>([]);
  const isExpanded = useMemo(
    () => findById(tocItem, activeId),
    [activeId, findById, tocItem]
  );

  const handleSelectionChange = useCallback((value: string[]) => {
    const selectItem = value[0];
    if (selectItem) {
      setExpandItem((prevExpandItem) =>
        prevExpandItem.includes(selectItem)
          ? prevExpandItem.filter((key) => key !== selectItem)
          : [...prevExpandItem, selectItem]
      );
    } else {
      setExpandItem(() => []);
    }
  }, []);

  const itemClasses = useMemo(
    () =>
      `flex w-full items-center justify-start text-left border-none p-2 rounded-lg text-sm font-medium transition-colors
     duration-200 ease-in-out gap-2 ${activeId === tocItem.id ? "bg-primary-100 text-primary" : ""}`,

    [activeId, tocItem.id]
  );

  return (
    <>
      {errorCodes?.length ? (
        <p className="text-sm font-medium text-danger">
          {errorCodes
            .map((errorCode) =>
              errorCode === "CHILD_INVALID" ? t("invalidChild") : errorCodes
            )
            .join(",")}
        </p>
      ) : (
        <Accordion
          type="multiple"
          className="flex w-full flex-col overflow-hidden"
          value={isExpanded ? [`${id}`] : expandItem}
          onValueChange={handleSelectionChange}
        >
          {children && children.length > 0 ? (
            <AccordionItem
              value={id}
              className="flex w-full flex-col border-none"
            >
              <AccordionTrigger className={itemClasses} isHeader={false}>
                {startContent}
              </AccordionTrigger>
              <AccordionContent className="flex h-fit w-full p-0">
                {(children?.length ?? 0) > 0 && currentDepth <= depth && (
                  <ul className="ml-4 w-full">
                    {children?.map((item) => (
                      <li key={item.id} className="mb-0 flex w-full flex-col">
                        <TableOfContentItem
                          className={className}
                          activeClassName={activeClassName}
                          activeId={activeId}
                          tocItem={item}
                          currentDepth={currentDepth + 1}
                          depth={depth}
                          onClick={onClick}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <AccordionItem value={id} className={itemClasses}>
              <div>{startContent}</div>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </>
  );
};

export default memo(TableOfContentItem);
