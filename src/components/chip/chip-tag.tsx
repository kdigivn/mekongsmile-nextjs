"use client";

import { memo } from "react";
import LinkBase from "../link-base";
import { Tag } from "@/services/infrastructure/wordpress/types/tag";

function ChipTag({ tag }: { tag: Tag }) {
  return (
    <LinkBase
      href={tag.uri}
      key={tag?.tagId}
      className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary"
    >
      {tag?.name}
    </LinkBase>
  );
}

export default memo(ChipTag);
