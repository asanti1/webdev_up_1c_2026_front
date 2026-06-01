export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): PaginationResult<T> {

  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: items.slice(start, end),
    total,
    page,
    limit,
    totalPages,
  };
}
