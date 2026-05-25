/** Format a Date as "YYYY-MM-DD" using local time. */
export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build a Monday-first month grid.
 * Always returns exactly 42 YYYY-MM-DD strings (6 weeks × 7 days) starting
 * from the Monday on/before the 1st. Trailing days bleed into the next month.
 */
export function buildMonthGrid(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - startWeekday);

  const days: string[] = [];
  const cursor = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
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
