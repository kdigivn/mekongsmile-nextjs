export type Tag = {
  link: string;
  name: string;
  tagId: number;
  uri: string;
  slug: string;
};

export type TagResponse = {
  tag: Tag;
};
