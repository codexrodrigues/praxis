export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort?: string;
}
