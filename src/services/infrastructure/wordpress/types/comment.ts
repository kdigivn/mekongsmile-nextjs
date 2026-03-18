import { Author } from "./author";

export type Comments = {
  nodes: Comment[];
};

export type Comment = {
  author: {
    node: Author;
  };
  content: string;
  date: string;
};
