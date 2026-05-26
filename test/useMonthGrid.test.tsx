import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMonthGrid } from "../src/headless/useMonthGrid";

describe("useMonthGrid", () => {
  it("initializes with the current month when no initial date given", () => {
    const now = new Date();
    const { result } = renderHook(() => useMonthGrid());
    expect(result.current.year).toBe(now.getFullYear());
    expect(result.current.month).toBe(now.getMonth());
  });

  it("initializes with the given year/month", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 4 }));
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(4);
  });

  it("returns a 42-day grid of YYYY-MM-DD strings", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 4 }));
    expect(result.current.days).toHaveLength(42);
    expect(result.current.days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("next() advances to next month", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 4 }));
    act(() => result.current.next());
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(5);
  });

  it("next() wraps from December to January and increments year", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 11 }));
    act(() => result.current.next());
    expect(result.current.year).toBe(2027);
    expect(result.current.month).toBe(0);
  });

  it("prev() goes back a month", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 4 }));
    act(() => result.current.prev());
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(3);
  });

  it("prev() wraps from January to December and decrements year", () => {
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 0 }));
    act(() => result.current.prev());
    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(11);
  });

  it("goToday() resets to the current month", () => {
    const now = new Date();
    const { result } = renderHook(() => useMonthGrid({ initialYear: 2020, initialMonth: 0 }));
    act(() => result.current.goToday());
    expect(result.current.year).toBe(now.getFullYear());
    expect(result.current.month).toBe(now.getMonth());
  });

  it("does not fire onMonthChange on mount", () => {
    const onMonthChange = vi.fn();
    renderHook(() => useMonthGrid({ initialYear: 2026, initialMonth: 4, onMonthChange }));
    expect(onMonthChange).not.toHaveBeenCalled();
  });

  it("fires onMonthChange with new (year, month) on next/prev", () => {
    const onMonthChange = vi.fn();
    const { result } = renderHook(() =>
      useMonthGrid({ initialYear: 2026, initialMonth: 11, onMonthChange }),
    );
    act(() => result.current.next());
    expect(onMonthChange).toHaveBeenLastCalledWith(2027, 0);
    act(() => result.current.prev());
    expect(onMonthChange).toHaveBeenLastCalledWith(2026, 11);
    expect(onMonthChange).toHaveBeenCalledTimes(2);
  });

  it("fires onMonthChange on goToday with today's (year, month)", () => {
    const onMonthChange = vi.fn();
    const now = new Date();
    const { result } = renderHook(() =>
      useMonthGrid({ initialYear: 2020, initialMonth: 0, onMonthChange }),
    );
    act(() => result.current.goToday());
    expect(onMonthChange).toHaveBeenCalledWith(now.getFullYear(), now.getMonth());
  });
});
