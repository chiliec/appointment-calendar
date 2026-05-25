/** Format a Date as "YYYY-MM-DD" using local time. */
export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build a Monday-first month grid.
 * Returns YYYY-MM-DD strings from the Monday on/before the 1st through the
 * Sunday on/after the last day of the month.
 */
export function buildMonthGrid(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - startWeekday);

  const endWeekday = (lastDay.getDay() + 6) % 7;
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(gridEnd.getDate() + (6 - endWeekday));

  const days: string[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(formatYMD(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Convert "HH:MM" or "HH:MM:SS" to minutes since midnight. Seconds are dropped. */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
