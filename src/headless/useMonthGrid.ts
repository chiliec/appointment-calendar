import { useCallback, useMemo, useState } from "react";
import { buildMonthGrid } from "./utils";

export interface UseMonthGridOptions {
  initialYear?: number;
  /** 0-indexed: 0 = January, 11 = December */
  initialMonth?: number;
  /** Fires after prev/next/goToday with the new visible (year, month). Not fired on mount. */
  onMonthChange?: (year: number, month: number) => void;
}

export interface UseMonthGridReturn {
  year: number;
  /** 0-indexed: 0 = January, 11 = December */
  month: number;
  /** Exactly 42 YYYY-MM-DD strings, Monday-first */
  days: string[];
  prev: () => void;
  next: () => void;
  goToday: () => void;
}

export function useMonthGrid(options: UseMonthGridOptions = {}): UseMonthGridReturn {
  const { onMonthChange } = options;
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(options.initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(options.initialMonth ?? now.getMonth());

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const prev = useCallback(() => {
    const newYear = month === 0 ? year - 1 : year;
    const newMonth = month === 0 ? 11 : month - 1;
    setYear(newYear);
    setMonth(newMonth);
    onMonthChange?.(newYear, newMonth);
  }, [year, month, onMonthChange]);

  const next = useCallback(() => {
    const newYear = month === 11 ? year + 1 : year;
    const newMonth = month === 11 ? 0 : month + 1;
    setYear(newYear);
    setMonth(newMonth);
    onMonthChange?.(newYear, newMonth);
  }, [year, month, onMonthChange]);

  const goToday = useCallback(() => {
    const today = new Date();
    const newYear = today.getFullYear();
    const newMonth = today.getMonth();
    setYear(newYear);
    setMonth(newMonth);
    onMonthChange?.(newYear, newMonth);
  }, [onMonthChange]);

  return { year, month, days, prev, next, goToday };
}
