import { useCallback, useMemo, useState } from "react";
import { buildMonthGrid } from "./utils";

export interface UseMonthGridOptions {
  initialYear?: number;
  /** 0-indexed: 0 = January, 11 = December */
  initialMonth?: number;
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
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(options.initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(options.initialMonth ?? now.getMonth());

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const prev = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const next = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }, []);

  return { year, month, days, prev, next, goToday };
}
