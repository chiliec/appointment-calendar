import type { Appointment } from "../types";
import { timeToMinutes } from "./utils";

/**
 * Check if two time ranges overlap.
 * Endpoints are exclusive (touching = no overlap). Callers pass whatever end
 * they want counted — session-only, or session + cleanup buffer.
 */
export function hasConflict(
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingEnd: number,
): boolean {
  return newStart < existingEnd && existingStart < newEnd;
}

export interface FindConflictsOptions<T extends Appointment> {
  /** Skip this appointment by id (useful when editing an existing one). */
  excludeId?: string;
  /**
   * Cleanup minutes reserved after a session before the next may start.
   * Each session blocks `[start, start + duration + buffer)`; two appointments
   * conflict when those blocked intervals overlap. Default `0` — cleanup is
   * non-blocking and back-to-back bookings are allowed.
   */
  buffer?: number;
  /**
   * Per-appointment buffer for existing appointments; overrides `buffer` for
   * each one. The proposed slot still uses the scalar `buffer` for its own
   * trailing cleanup. Example: `(apt) => apt.skip_cleanup ? 0 : 15`.
   */
  getBuffer?: (apt: T) => number;
}

/**
 * Find existing appointments that conflict with a proposed slot.
 *
 * @param startTime  Proposed start ("HH:MM" or "HH:MM:SS").
 * @param duration   Proposed session length in minutes.
 * @param appointments  Existing appointments to check against.
 * @param options    See {@link FindConflictsOptions}. Defaults reproduce
 *                   session-only overlap (no cleanup buffer).
 */
export function findConflicts<T extends Appointment>(
  startTime: string,
  duration: number,
  appointments: T[],
  options: FindConflictsOptions<T> = {},
): T[] {
  const { excludeId, buffer = 0, getBuffer } = options;
  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + duration + buffer;

  return appointments.filter((apt) => {
    if (excludeId && apt.id === excludeId) return false;
    const aptStart = timeToMinutes(apt.start_time);
    const aptBuffer = getBuffer ? getBuffer(apt) : buffer;
    const aptEnd = aptStart + apt.duration + aptBuffer;
    return hasConflict(newStart, newEnd, aptStart, aptEnd);
  });
}
