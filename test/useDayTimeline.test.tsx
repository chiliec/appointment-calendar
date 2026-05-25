import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDayTimeline } from "../src/headless/useDayTimeline";
import type { Appointment } from "../src/types";

const appt = (id: string, start: string, duration: number, date = "2026-05-26"): Appointment => ({
  id,
  date,
  start_time: start,
  duration,
});

describe("useDayTimeline", () => {
  it("splits hours into early / work / late based on workStart and workEnd", () => {
    const { result } = renderHook(() =>
      useDayTimeline({ date: "2026-05-26", appointments: [], workStart: 9, workEnd: 21 }),
    );
    expect(result.current.earlyHours).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.current.workHours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.current.lateHours).toEqual([21, 22, 23]);
  });

  it("defaults workStart=9 and workEnd=21", () => {
    const { result } = renderHook(() =>
      useDayTimeline({ date: "2026-05-26", appointments: [] }),
    );
    expect(result.current.workHours[0]).toBe(9);
    expect(result.current.workHours[result.current.workHours.length - 1]).toBe(20);
  });

  it("flags hasEarlyAppointments and counts them", () => {
    const appts = [appt("a", "07:00", 60), appt("b", "10:00", 60)];
    const { result } = renderHook(() => useDayTimeline({ date: "2026-05-26", appointments: appts }));
    expect(result.current.hasEarlyAppointments).toBe(true);
    expect(result.current.earlyAppointmentsCount).toBe(1);
  });

  it("flags hasLateAppointments and counts them", () => {
    const appts = [appt("a", "10:00", 60), appt("b", "22:00", 60)];
    const { result } = renderHook(() => useDayTimeline({ date: "2026-05-26", appointments: appts }));
    expect(result.current.hasLateAppointments).toBe(true);
    expect(result.current.lateAppointmentsCount).toBe(1);
  });

  it("returns nowLineMinutes when date is today", () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const { result } = renderHook(() =>
      useDayTimeline({ date: `${y}-${m}-${d}`, appointments: [] }),
    );
    expect(result.current.nowLineMinutes).not.toBeNull();
    expect(typeof result.current.nowLineMinutes).toBe("number");
  });

  it("returns nowLineMinutes=null when date is not today", () => {
    const { result } = renderHook(() =>
      useDayTimeline({ date: "1999-01-01", appointments: [] }),
    );
    expect(result.current.nowLineMinutes).toBeNull();
  });
});
