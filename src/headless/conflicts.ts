import type { Appointment } from "../types";
import { timeToMinutes } from "./utils";

/**
 * Check if two time ranges overlap.
 * `newSessionEnd` and `existingSessionEnd` are exclusive endpoints (touching = no overlap).
 * Cleanup time is buffer — not counted as conflict here. The caller passes session-only
 * endpoints.
 */
export function hasConflict(
  newStart: number,
  newSessionEnd: number,
  existingStart: number,
  existingSessionEnd: number,
): boolean {
  return newStart < existingSessionEnd && existingStart < newSessionEnd;
}

/**
 * Find conflicts between a proposed slot and existing appointments.
 * Pass `excludeId` to skip an appointment (useful when editing an existing one).
 */
export function findConflicts<T extends Appointment>(
  startTime: string,
  duration: number,
  appointments: T[],
  excludeId?: string,
): T[] {
  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + duration;

  return appointments.filter((apt) => {
    if (excludeId && apt.id === excludeId) return false;
    const aptStart = timeToMinutes(apt.start_time);
    const aptEnd = aptStart + apt.duration;
    return hasConflict(newStart, newEnd, aptStart, aptEnd);
  });
}
