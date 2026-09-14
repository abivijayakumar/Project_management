/**
 * Format an ISO date string to readable format (e.g., Oct 14, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return '—';
  }
};

/**
 * Format ISO date for HTML date input values (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Determine if a due date is in the past
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  return new Date(dueDate) < new Date();
};
