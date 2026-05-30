import { describe, it, expect } from "vitest";
import { generateSlots } from "../src/headless/generateSlots";
import type { Appointment } from "../src/types";

const appt = (
  id: string,
  start: string,
  duration: number,
  date = "2026-05-26",
): Appointment => ({ id, date, start_time: start, duration });

const byTime = (slots: { time: string }[]) =>
  Object.fromEntries(slots.map((s) => [s.time, s])) as Record<
    string,
    { time: string; available: boolean; conflictIds: string[] }
  >;

describe("generateSlots", () => {
  it("fills the full grid when no appointments exist", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 12,
    });
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots.every((s) => s.available && s.conflictIds.length === 0)).toBe(
      true,
    );
  });

  it("marks overlapping candidates unavailable with conflictIds", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [appt("a", "10:00", 60)],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 12,
    });
    const t = byTime(slots);
    expect(t["09:00"].available).toBe(true);
    expect(t["10:00"].available).toBe(false);
    expect(t["10:00"].conflictIds).toEqual(["a"]);
    expect(t["11:00"].available).toBe(true);
  });

  it("buffer widens the blocked range around an appointment", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [appt("a", "10:00", 60)],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 13,
      buffer: 15,
    });
    const t = byTime(slots);
    expect(t["09:00"].available).toBe(false);
    expect(t["09:00"].conflictIds).toEqual(["a"]);
    expect(t["11:00"].available).toBe(false);
    expect(t["12:00"].available).toBe(true);
  });

  it("getBuffer applies per-appointment buffers to existing appointments", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [appt("a", "10:00", 60)],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 12,
      getBuffer: () => 30,
    });
    const t = byTime(slots);
    expect(t["11:00"].available).toBe(false);
    expect(t["11:00"].conflictIds).toEqual(["a"]);
  });

  it("excludeId frees the slots blocked by the excluded appointment", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [appt("a", "10:00", 60)],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 12,
      excludeId: "a",
    });
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("includes the slot whose session ends exactly at workEnd, excludes the next", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [],
      duration: 60,
      step: 30,
      workStart: 20,
      workEnd: 21,
    });
    expect(slots.map((s) => s.time)).toEqual(["20:00"]);
  });

  it("yields a single slot when step exceeds the working day", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [],
      duration: 60,
      step: 600,
      workStart: 9,
      workEnd: 12,
    });
    expect(slots.map((s) => s.time)).toEqual(["09:00"]);
  });

  it("ignores appointments on other dates", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [appt("a", "10:00", 60, "2026-05-27")],
      duration: 60,
      step: 60,
      workStart: 9,
      workEnd: 12,
    });
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("defaults workStart/workEnd to 9/21", () => {
    const slots = generateSlots({
      date: "2026-05-26",
      appointments: [],
      duration: 60,
      step: 60,
    });
    expect(slots[0].time).toBe("09:00");
    expect(slots[slots.length - 1].time).toBe("20:00");
  });
});
