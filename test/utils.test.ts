import { describe, it, expect } from "vitest";
import { formatYMD, buildMonthGrid, timeToMinutes, minutesToTime } from "../src/headless/utils";

describe("formatYMD", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(formatYMD(new Date(2026, 4, 26))).toBe("2026-05-26");
  });

  it("zero-pads single-digit month and day", () => {
    expect(formatYMD(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("buildMonthGrid", () => {
  it("returns a Monday-first grid that includes all days of the month", () => {
    const grid = buildMonthGrid(2026, 4); // May 2026
    expect(grid).toContain("2026-05-01");
    expect(grid).toContain("2026-05-31");
  });

  it("starts on a Monday and ends on a Sunday", () => {
    const grid = buildMonthGrid(2026, 4); // May 2026 (May 1 = Friday)
    const first = new Date(grid[0] + "T12:00:00");
    const last = new Date(grid[grid.length - 1] + "T12:00:00");
    expect((first.getDay() + 6) % 7).toBe(0);
    expect((last.getDay() + 6) % 7).toBe(6);
  });

  it("includes bleed days from the previous month when month starts mid-week", () => {
    const grid = buildMonthGrid(2026, 4); // May 2026 (1st = Friday)
    expect(grid[0]).toBe("2026-04-27");
  });

  it("includes bleed days from the next month when month ends mid-week", () => {
    const grid = buildMonthGrid(2026, 1); // February 2026 (28th = Saturday)
    // Grid is always 42 days; Feb 2026 starts Sunday so it bleeds into March
    expect(grid).toContain("2026-03-01");
    expect(grid[grid.length - 1]).toBe("2026-03-08");
  });

  it("handles leap year February", () => {
    const grid = buildMonthGrid(2028, 1); // February 2028 (leap year, 29 days)
    expect(grid).toContain("2028-02-29");
  });

  it("handles December (month wrap)", () => {
    const grid = buildMonthGrid(2026, 11); // December 2026
    expect(grid).toContain("2026-12-01");
    expect(grid).toContain("2026-12-31");
  });
});

describe("buildMonthGrid length", () => {
  it("always returns exactly 42 entries (6 weeks × 7 days)", () => {
    // Various months that previously produced 28, 35, or 42 days
    expect(buildMonthGrid(2027, 1)).toHaveLength(42); // Feb 2027, Mon→Sun, 28 days
    expect(buildMonthGrid(2026, 1)).toHaveLength(42); // Feb 2026, Sun start, 28 days
    expect(buildMonthGrid(2023, 9)).toHaveLength(42); // Oct 2023, 31 days
    expect(buildMonthGrid(2026, 4)).toHaveLength(42); // May 2026
    expect(buildMonthGrid(2026, 11)).toHaveLength(42); // Dec 2026
  });
});

describe("minutesToTime", () => {
  it("formats minutes since midnight as zero-padded HH:MM", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(575)).toBe("09:35");
    expect(minutesToTime(1260)).toBe("21:00");
  });

  it("round-trips with timeToMinutes", () => {
    expect(minutesToTime(timeToMinutes("13:45"))).toBe("13:45");
  });
});

describe("timeToMinutes", () => {
  it("parses HH:MM format", () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("parses HH:MM:SS format (ignoring seconds)", () => {
    expect(timeToMinutes("14:15:00")).toBe(855);
  });

  it("parses midnight as 0", () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });

  it("parses end of day", () => {
    expect(timeToMinutes("23:59")).toBe(23 * 60 + 59);
  });
});
