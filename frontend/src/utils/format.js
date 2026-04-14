import dayjs from 'dayjs';

export function formatDateTime(value, pattern = 'YYYY-MM-DD HH:mm') {
  if (!value) return '-';
  return dayjs(value).format(pattern);
}

export function formatDate(value, pattern = 'YYYY-MM-DD') {
  if (!value) return '-';
  return dayjs(value).format(pattern);
}

export function formatYearMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}
