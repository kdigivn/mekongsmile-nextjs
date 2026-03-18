export type InfinityPaginationType<T> = {
  hasNextPage: boolean;
  data: T[];
  total?: number;
  next_cursor?: string;
};
