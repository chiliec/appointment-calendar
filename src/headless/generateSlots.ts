import type { Appointment } from "../types";
import { findConflicts } from "./conflicts";
import { minutesToTime } from "./utils";

export interface GenerateSlotsOptions<T extends Appointment> {
  /** "YYYY-MM-DD" — the day to generate slots for. */
  date: string;
  /** Existing appointments; filtered to `date` internally. */
  appointments: T[];
  /** Session length being booked, in minutes. */
  duration: number;
  /** Minutes between candidate start times. */
  step: number;
  /** Opening hour (0-23). Default 9. Matches DayTimeline. */
  workStart?: number;
  /** Closing hour (0-24). Default 21. Matches DayTimeline. */
  workEnd?: number;
  /** Trailing cleanup minutes for the slot being booked. Default 0. */
  buffer?: number;
  /** Per-appointment buffer for existing appointments (see findConflicts). */
  getBuffer?: (apt: T) => number;
  /** Skip this appointment by id — useful when rescheduling. */
  excludeId?: string;
}

export interface Slot {
  /** Candidate start, "HH:MM". */
  time: string;
  /** True when no existing appointment conflicts. */
  available: boolean;
  /** Ids of overlapping appointments; empty when available. */
  conflictIds: string[];
}

/**
 * Generate the bookable start-time grid for a single day.
 *
 * Candidate starts run from `workStart` by `step` minutes while the session
 * ends by `workEnd` (start-minutes + `duration` must not exceed `workEnd × 60`);
 * the trailing `buffer` may spill past close. Each candidate's availability is
 * computed with
 * {@link findConflicts}, so overlap/buffer semantics are identical to it.
 */
export function generateSlots<T extends Appointment>(
  options: GenerateSlotsOptions<T>,
): Slot[] {
  const {
    date,
    appointments,
    duration,
    step,
    workStart = 9,
    workEnd = 21,
    buffer = 0,
    getBuffer,
    excludeId,
  } = options;

  const dayAppointments = appointments.filter((apt) => apt.date === date);
  const endMin = workEnd * 60;
  const slots: Slot[] = [];

  for (let start = workStart * 60; start + duration <= endMin; start += step) {
    const time = minutesToTime(start);
    const conflictIds = findConflicts(time, duration, dayAppointments, {
      excludeId,
      buffer,
      getBuffer,
    }).map((a) => a.id);
    slots.push({ time, available: conflictIds.length === 0, conflictIds });
  }

  return slots;
}
