export interface SearchResult<T> {
  count: number;
  offset: number;
  limit: number;
  items: T[];
}
