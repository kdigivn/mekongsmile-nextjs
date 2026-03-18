import { TableOfContentErrorEnum } from "./table-of-content.enum";

export type TableOfContentNode = {
  id: string;
  title: string;
  depth: number;
  errorCodes?: TableOfContentErrorEnum[];
  children?: TableOfContentNode[];
};

export type TableOfContent = {
  // Table of content object
  toc: TableOfContentNode[];
  // New content whose headings are updated with IDs
  content: string;
};
