import { textAlignOptions } from "@/lib/utils";
export type Block = {
  name: string;
  dynamicContent: string;
  id?: string;
  attributes: {
    textAlign?: keyof typeof textAlignOptions;
    content: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    isStackedOnMobile?: boolean;
    textColor?: string;
    backgroundColor?: string;
    style?: {
      color?: {
        text?: string;
        background?: string;
      };
    };
    height?: number;
    width?: string;
    url: string;
    alt?: string;
    align?: "left" | "center" | "right";
  };
  innerBlocks?: Block[];
};
