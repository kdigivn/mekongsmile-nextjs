import { cn } from "@/lib/utils";
import React, { memo, ReactNode } from "react";

type Props = {
  dotColor?: string; // Add tailwindcss class
  wrapper?: string; // Add tailwindcass class
  isDisplayDot?: boolean;
  contentClass?: string; // Add tailwindcass class
  children?: ReactNode;
  headingTag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; // Add level prop
};

/**
 * HeadingBase component is a flexible and reusable UI component that renders a heading with an optional decorative dot.
 *
 * @param {string} [dotColor="bg-primary-100"] - Tailwind CSS class for the background color of the decorative dot. Defaults to "bg-primary-100".
 * @param {string} [wrapper="mx-2 mb-8"] - Tailwind CSS class for the heading container. Defaults to "mx-2 mb-8".
 * @param {boolean} [isDisplayDot=true] - A boolean to control whether the decorative dot should be displayed. Defaults to true.
 * @param {string} [contentClass=""] - Additional Tailwind CSS classes to customize the heading appearance.
 * @param {ReactNode} children - The content (usually text) to be displayed inside the heading.
 * @param {'p'|'h1'| 'h2'| 'h3'| 'h4'| 'h5'| 'h6'}  - The heading level (h1, h2, h3, h4, h5, h6). Defaults to h2.
 * @param {boolean} [isDiv=false] - A boolean to control whether the heading should be rendered as a div element. Defaults to false.
 * @returns {JSX.Element} - Returns a JSX element that includes a styled heading with an optional decorative dot.
 *
 * Usage:
 * ```
 * <HeadingBase
 *    dotColor="bg-danger"
 *    contentMargin="mb-10"
 *    isDisplayDot={true}
 *    contentClass="text-2xl text-center text-blue-600"
 * >
 *    Your Heading Text
 * </HeadingBase>
 * ```
 */
const HeadingBase = ({
  dotColor = "bg-primary-100",
  wrapper = "mx-2 mb-2",
  isDisplayDot = true,
  contentClass,
  headingTag = "h2", // Default to h2
  children,
}: Props) => {
  const supportedHeadings = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];
  const Tag =
    supportedHeadings.find((heading) => heading === headingTag) ??
    supportedHeadings[0];

  const HeadingTag = Tag as keyof React.JSX.IntrinsicElements; // Dynamically set heading tag

  const fontSizeMap = {
    h1: "text-3xl",
    h2: "text-2xl",
    h3: "text-xl",
    h4: "text-base",
    h5: "text-sm",
    h6: "text-xs",
    p: "text-base",
  }[headingTag];

  return (
    <div className={cn("flex flex-col", wrapper)}>
      <div className="relative">
        <div
          className={cn(
            "relative z-20 font-bold before:absolute before:-left-[0.4em] before:bottom-[0em] before:rounded-[.2em] before:bg-primary-100 before:content-['']",
            `before:h-[0.8em] before:w-[0.8em] before:${dotColor}`,
            contentClass,
            fontSizeMap,
            !isDisplayDot && "before:hidden"
          )}
        >
          <HeadingTag
            className={cn("relative z-30", fontSizeMap, contentClass)}
          >
            {children}
          </HeadingTag>
        </div>
      </div>
    </div>
  );
};

export default memo(HeadingBase);
