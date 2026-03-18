/* eslint-disable @arthurgeron/react-usememo/require-memo */
import React from "react";

interface HighlightProps {
  searchTerm: string;
  text: string;
  className?: string;
  highlightClassName?: string;
}

const Highlight = ({
  searchTerm,
  text,
  className = "",
  highlightClassName = "",
}: HighlightProps) => {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default Highlight;
