/**
 * Formats ISO date strings into friendly human-readable date ranges.
 * e.g., ("2026-07-12", "2026-07-15") -> "Jul 12 – 15, 2026"
 * e.g., ("2026-07-28", "2026-08-05") -> "Jul 28 – Aug 5, 2026"
 */
export function formatFriendlyDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return `${startDateStr || ''} – ${endDateStr || ''}`;

  try {
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${startDateStr} → ${endDateStr}`;
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
  } catch (e) {
    return `${startDateStr} → ${endDateStr}`;
  }
}

export function formatSingleDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
