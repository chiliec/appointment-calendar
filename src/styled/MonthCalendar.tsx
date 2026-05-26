import { useMemo } from "react";
import type { DayCounts, Labels } from "../types";
import { useMonthGrid } from "../headless/useMonthGrid";
import { formatYMD } from "../headless/utils";

export interface MonthCalendarProps {
  /** Selected date as "YYYY-MM-DD" */
  selected: string;
  onSelect: (date: string) => void;
  /** Workload counts keyed by date (drives the dots under each day) */
  dayCounts?: DayCounts;
  /** Initial visible month (year + 0-indexed month). Defaults to today. */
  initialYear?: number;
  initialMonth?: number;
  /** BCP-47 locale used for Intl date formatting. Default "en-US". */
  locale?: string;
  /** Fires after prev/next/today with the new visible (year, month). Not fired on mount. */
  onMonthChange?: (year: number, month: number) => void;
  /** Static strings shown in the UI. */
  labels: Labels;
}

export function MonthCalendar(props: MonthCalendarProps) {
  const { selected, onSelect, dayCounts = {}, locale = "en-US", labels, onMonthChange } = props;
  const { year, month, days, prev, next, goToday } = useMonthGrid({
    initialYear: props.initialYear,
    initialMonth: props.initialMonth,
    onMonthChange,
  });

  const todayStr = useMemo(() => formatYMD(new Date()), []);

  const monthTitle = useMemo(() => {
    if (labels.monthYear) return labels.monthYear(year, month);
    return new Date(year, month, 1).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
    });
  }, [year, month, locale, labels]);

  const selectedDate = useMemo(() => {
    return new Date(selected + "T12:00:00").toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selected, locale]);

  return (
    <section className="ac-root">
      <div className="ac-month-header">
        <button
          type="button"
          onClick={prev}
          className="ac-month-nav-btn"
          aria-label="Previous month"
        >
          ←
        </button>
        <div>
          <p className="ac-month-title">{monthTitle}</p>
          <button type="button" onClick={goToday} className="ac-today-btn">
            {labels.today}
          </button>
        </div>
        <button
          type="button"
          onClick={next}
          className="ac-month-nav-btn"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="ac-weekday-row">
        {labels.weekdays.map((w, i) => (
          <div key={i} className="ac-weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="ac-day-grid">
        {days.map((d) => {
          const dayDate = new Date(d + "T12:00:00");
          const dayNum = dayDate.getDate();
          const isCurrentMonth = dayDate.getMonth() === month;
          if (!isCurrentMonth) {
            return <div key={d} className="ac-day-cell--blank" aria-hidden />;
          }
          const isSelected = d === selected;
          const isToday = d === todayStr;
          const count = dayCounts[d] ?? 0;
          const cls = ["ac-day-cell"];
          if (isSelected) cls.push("ac-day-cell--selected");
          else if (isToday) cls.push("ac-day-cell--today");
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={cls.join(" ")}
              aria-pressed={isSelected}
            >
              <span>{dayNum}</span>
              {count > 0 && (
                <span className="ac-day-dots">
                  {Array.from({ length: count }, (_, i) => (
                    <span key={i} className="ac-day-dot" aria-hidden />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="ac-selected-date">{selectedDate}</p>
    </section>
  );
}
