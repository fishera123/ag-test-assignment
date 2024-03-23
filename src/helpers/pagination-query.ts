export interface PaginationQueryFilter {
  skip: number;
  limit: number;
  page: number;
}

export type PaginationParams = {
  page?: string;
  limit?: string;
};

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

export function buildPaginationFilter(params: PaginationParams): PaginationQueryFilter {
  const limit = setLimit(params.limit);
  const page = setPage(params.page);
  const skip = setOffset(page, limit);

  return {
    limit,
    skip,
    page,
  };
}

function setPage(page?: string): number {
  if (Number(page) > 0) {
    return Number(page);
  } else {
    return DEFAULT_PAGE;
  }
}

function setLimit(limit?: string): number {
  switch (true) {
    case Number(limit) > MAX_LIMIT:
      return MAX_LIMIT;
    case Number(limit) > 0:
      return Number(limit);
    default:
      return DEFAULT_LIMIT;
  }
}

function setOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
