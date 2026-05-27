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
    const result = findConflicts("09:00", 60, existing, { excludeId: "a" });
    expect(result).toEqual([]);
  });

  it("does not count cleanup buffer by default — adjacent sessions are not conflicts", () => {
    const result = findConflicts("10:00", 60, existing);
    expect(result.map((a) => a.id)).toEqual([]);
  });
});

describe("findConflicts with a cleanup buffer", () => {
  const existing: Appointment[] = [appt("a", "09:00", 60)];

  it("blocks a slot that starts within the buffer after a session", () => {
    // a runs 09:00–10:00; with 15m cleanup it is blocked until 10:15.
    const result = findConflicts("10:00", 60, existing, { buffer: 15 });
    expect(result.map((a) => a.id)).toEqual(["a"]);
  });

  it("allows a slot that starts exactly at the buffer end", () => {
    const result = findConflicts("10:15", 60, existing, { buffer: 15 });
    expect(result).toEqual([]);
  });

  it("blocks a slot whose trailing buffer reaches back into an existing session", () => {
    // Proposed 08:00–09:00 + 15m cleanup blocks until 09:15, overlapping a's start.
    const result = findConflicts("08:00", 60, existing, { buffer: 15 });
    expect(result.map((a) => a.id)).toEqual(["a"]);
  });

  it("honors a per-appointment buffer via getBuffer", () => {
    type Apt = Appointment & { skip_cleanup: boolean };
    const appts: Apt[] = [
      { id: "a", date: "2026-05-26", start_time: "09:00", duration: 60, skip_cleanup: true },
      { id: "b", date: "2026-05-26", start_time: "11:00", duration: 60, skip_cleanup: false },
    ];
    const getBuffer = (apt: Apt) => (apt.skip_cleanup ? 0 : 15);

    // a skips cleanup, so a 10:00 start right after it is fine.
    expect(
      findConflicts("10:00", 60, appts, { getBuffer }).map((x) => x.id),
    ).toEqual([]);

    // b keeps its 15m cleanup; b runs 11:00–12:00, blocked until 12:15.
    expect(
      findConflicts("12:00", 60, appts, { getBuffer }).map((x) => x.id),
    ).toEqual(["b"]);
  });
});
