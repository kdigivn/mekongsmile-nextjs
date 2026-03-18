"use client";

import { memo } from "react";
import TableOfContent from "./TableOfContent";
import { TableOfContentNode } from "./types/table-of-content.type";
import useHighLightActiveHeading from "@/hooks/use-highlight-active-heading";

const defaultStyle = {
  className: "",
  itemClassName: `transition-all duration-100 hover:text-primary`,
  activeItemClassName: "text-primary",
};

type Props = {
  toc: TableOfContentNode[];
  style?: {
    className?: string;
    titleClassName?: string;
    contentClassName?: string;
    itemClassName?: string;
    activeItemClassName?: string;
  };
  titleText?: string;
  depth: number;
  onItemClicked?: () => void;
};
/**
 * A Table of Content that highlight active heading
 * @param {Object} props
 * @param {Object} props.toc Table of Content Object
 * @param {Object} props.style Class name for this component
 * @param {string} props.style.className Wrapper class name
 * @param {string} props.style.titleClassName Title class name.
 * @param {string} props.style.contentClassName Class name of content section
 * @param {string} props.style.itemClassName Item class name
 * @param {string} props.style.activeItemClassName active item class name
 * @param {string} props.titleText Title text
 * @param {number} props.depth Max display depth based on heading level. From 2-6.
 *
 * Default value is 6.
 * @param {()=>{}} props.onItemClicked Handler when an item is clicked
 * @returns
 */
const TableOfContentActiveHeading = ({
  toc,
  style = defaultStyle,
  titleText,
  depth = 6,
  onItemClicked,
}: Props) => {
  // Merge input style with default style
  style = { ...defaultStyle, ...style };

  const { inViewId } = useHighLightActiveHeading(
    ".post-detail",
    "h2,h3,h4,h5,h6"
  );
  if (toc.length > 0) {
    return (
      <TableOfContent
        toc={toc}
        style={style}
        titleText={titleText}
        activeId={inViewId}
        depth={depth}
        onItemClicked={onItemClicked}
      />
    );
  } else {
    return <></>;
  }
};

export default memo(TableOfContentActiveHeading);
