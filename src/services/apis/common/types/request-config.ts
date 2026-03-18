export type RequestConfigType = {
  signal?: AbortSignal | null;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};
