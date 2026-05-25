/** Minimal appointment shape the package understands. */
export interface Appointment {
  /** Unique identifier */
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" or "HH:MM:SS" */
  start_time: string;
  /** Duration in minutes (session only, not including any cleanup buffer) */
  duration: number;
}

/** Workload counts keyed by date string ("YYYY-MM-DD"). */
export type DayCounts = Record<string, number>;

/** Static strings shown in the UI. Defaults are English. */
export interface Labels {
  today: string;
  /** Mon..Sun, exactly 7 entries */
  weekdays: [string, string, string, string, string, string, string];
  /** Render the month-year heading. Defaults to Intl.DateTimeFormat(locale). */
  monthYear?: (year: number, month: number) => string;
  /** Render the appointments-count line (used by DayTimeline header). */
  appointmentsCount?: (n: number) => string;
  /** "Show early hours" button label. */
  showEarlyHours?: (workStart: number) => string;
  /** "Hide early hours" button label. */
  hideEarlyHours?: string;
  /** "Show late hours" button label. */
  showLateHours?: (workEnd: number) => string;
  /** "Hide late hours" button label. */
  hideLateHours?: string;
  /** Header above the timeline (e.g. "Schedule"). */
  schedule?: string;
  /** Shown while data is loading. */
  loading?: string;
}
