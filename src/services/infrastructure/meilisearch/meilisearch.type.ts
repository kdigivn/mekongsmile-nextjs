export enum SearchContentType {
  POST = "POST",
  PRODUCT = "PRODUCT",
  PAGE = "PAGE",
  TAG = "TAG",
  TERM = "TERM",
}

export type SearchDocument = {
  /**
   * Unique ID of this search object
   */
  id: string;
  /**
   * When a content of a post is to long, we need to split it into many small chunks. Each chunk should have a unique `id` and a `parent_id` that point to the original post. In that case, this `parent_id` field will be use as a distinct attribute to avoid duplicate results.
   */
  parent_id?: string;
  /**
   * Type of this search object. This is necessary for the UI to do conditional rendering base on object type.
   */
  type: SearchContentType;
  /**
   * The title of a post
   */
  title: string;
  /**
   * The url of a post
   */
  url: string;
  /**
   * The content of a post. In case a post is splitted into small chunks, this will store a chunk's content.
   */
  content?: string;
  /**
   * URL of post thumbnail
   */
  thumbnailUrl?: string;
  /**
   * Post created time
   */
  createdAt?: Date;
  /**
   * Post modified time
   */
  modifiedAt?: Date;
};
