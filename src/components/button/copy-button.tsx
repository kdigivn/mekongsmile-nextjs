"use client";

import React, { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn button is imported from here
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type CopyButtonProps = {
  textToCopy: string;
  iconSize?: number;
  onCopied?: () => void;
  buttonType?: "icon" | "button";
};
function CopyButton({
  textToCopy,
  iconSize = 16,
  onCopied,
  buttonType = "icon",
}: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard(
    useMemo(() => ({ onCopy: onCopied }), [onCopied])
  );

  const handleCopy = useCallback(() => {
    copyToClipboard(textToCopy);
  }, [copyToClipboard, textToCopy]);

  return buttonType === "icon" ? (
    <Button
      onClick={handleCopy}
      className="transition-all duration-300 hover:bg-opacity-80"
      size="sm"
      variant={"ghost"}
      aria-label={isCopied ? "Copied" : "Copy"}
    >
      {isCopied ? <LuCopyCheck size={iconSize} /> : <LuCopy size={iconSize} />}
    </Button>
  ) : (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {isCopied ? <LuCopyCheck size={iconSize} /> : <LuCopy size={iconSize} />}{" "}
      Copy
    </Button>
  );
}

export default memo(CopyButton);
