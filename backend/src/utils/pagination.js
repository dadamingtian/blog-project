function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export function parsePagination(query = {}, defaults = {}) {
  const defaultPage = toPositiveInt(defaults.page, 1);
  const defaultPageSize = toPositiveInt(defaults.pageSize, 10);
  const page = toPositiveInt(query.page, defaultPage);
  const pageSizeRaw = toPositiveInt(query.pageSize, defaultPageSize);
  const maxPageSize = toPositiveInt(defaults.maxPageSize, 100);
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), maxPageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  };
}

export function buildPaginationResult({ page, pageSize, total }) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages
  };
}
