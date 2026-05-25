import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "../types";
import { formatYMD, timeToMinutes } from "./utils";

export interface UseDayTimelineOptions<T extends Appointment> {
  /** Selected date as "YYYY-MM-DD" */
  date: string;
  /** Appointments to render. Filtering by `date` is the caller's responsibility. */
  appointments: T[];
  /** Hour at which the work day begins (inclusive, 0–23). Default 9. */
  workStart?: number;
  /** Hour at which the work day ends (exclusive, 0–24). Default 21. */
  workEnd?: number;
}

export interface UseDayTimelineReturn {
  earlyHours: number[];
  workHours: number[];
  lateHours: number[];
  hasEarlyAppointments: boolean;
  hasLateAppointments: boolean;
  earlyAppointmentsCount: number;
  lateAppointmentsCount: number;
  /** Minutes since midnight, or null if `date` is not today. */
  nowLineMinutes: number | null;
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

export function useDayTimeline<T extends Appointment>(
  options: UseDayTimelineOptions<T>,
): UseDayTimelineReturn {
  const workStart = options.workStart ?? 9;
  const workEnd = options.workEnd ?? 21;
  const { date, appointments } = options;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = globalThis.setInterval(() => setNow(new Date()), 60_000);
    return () => globalThis.clearInterval(id);
  }, []);

  return useMemo(() => {
    const earlyHours = ALL_HOURS.filter((h) => h < workStart);
    const workHours = ALL_HOURS.filter((h) => h >= workStart && h < workEnd);
    const lateHours = ALL_HOURS.filter((h) => h >= workEnd);

    const earlyAppointments = appointments.filter(
      (a) => timeToMinutes(a.start_time) < workStart * 60,
    );
    const lateAppointments = appointments.filter(
      (a) => timeToMinutes(a.start_time) >= workEnd * 60,
    );

    const isToday = date === formatYMD(now);
    const nowLineMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : null;

    return {
      earlyHours,
      workHours,
      lateHours,
      hasEarlyAppointments: earlyAppointments.length > 0,
      hasLateAppointments: lateAppointments.length > 0,
      earlyAppointmentsCount: earlyAppointments.length,
      lateAppointmentsCount: lateAppointments.length,
      nowLineMinutes,
    };
  }, [appointments, date, workStart, workEnd, now]);
}
