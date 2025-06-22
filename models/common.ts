export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResult<T> {
  data: T;
  pagination: Pagination;

  constructor(data: T, pagination: Pagination) {
    this.data = data;
    this.pagination = pagination;
  }
}

export class PagingParams {
    currentPage: number = 1;
    itemsPerPage: number = 20;

    constructor(page?: number, limit?: number) {
        if (page)
            this.currentPage = page;

        if (limit)
            this.itemsPerPage = limit;
    }
}