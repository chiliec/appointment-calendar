import { describe, it, expect } from "vitest";
import { hasConflict, findConflicts } from "../src/headless/conflicts";
import type { Appointment } from "../src/types";

const appt = (id: string, start: string, duration: number): Appointment => ({
  id,
  date: "2026-05-26",
  start_time: start,
  duration,
});

describe("hasConflict", () => {
  it("returns true for overlapping ranges (new starts inside existing)", () => {
    expect(hasConflict(60, 120, 30, 90)).toBe(true);
  });

  it("returns true for overlapping ranges (existing starts inside new)", () => {
    expect(hasConflict(30, 90, 60, 120)).toBe(true);
  });

  it("returns false for adjacent ranges (touching but not overlapping)", () => {
    expect(hasConflict(60, 120, 120, 180)).toBe(false);
  });

  it("returns false for fully separate ranges", () => {
    expect(hasConflict(60, 120, 180, 240)).toBe(false);
  });
});

describe("findConflicts", () => {
  const existing: Appointment[] = [
    appt("a", "09:00", 60),
    appt("b", "11:00", 90),
  ];

  it("returns conflicting appointments when new slot overlaps", () => {
    const result = findConflicts("09:30", 60, existing);
    expect(result.map((a) => a.id)).toEqual(["a"]);
  });

  it("returns empty when slot fits between existing appointments", () => {
    const result = findConflicts("10:00", 60, existing);
    expect(result).toEqual([]);
  });

  it("returns multiple conflicts when slot overlaps several", () => {
    const longer = [...existing, appt("c", "09:45", 30)];
    const result = findConflicts("09:30", 90, longer);
    expect(result.map((a) => a.id).sort()).toEqual(["a", "c"]);
  });

  it("excludes the given id when provided (useful when editing)", () => {
    const result = findConflicts("09:00", 60, existing, "a");
    expect(result).toEqual([]);
  });

  it("does not count cleanup buffer — adjacent sessions are not conflicts", () => {
    const result = findConflicts("10:00", 60, existing);
    expect(result.map((a) => a.id)).toEqual([]);
  });
});
