import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonthCalendar } from "../src/styled/MonthCalendar";

describe("MonthCalendar", () => {
  it("renders 7 weekday headers from labels", () => {
    render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={() => {}}
        initialYear={2026}
        initialMonth={4}
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    expect(screen.getByText("Mo")).toBeInTheDocument();
    expect(screen.getByText("Su")).toBeInTheDocument();
  });

  it("highlights the selected day with .ac-day-cell--selected", () => {
    const { container } = render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={() => {}}
        initialYear={2026}
        initialMonth={4}
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    const selected = container.querySelector(".ac-day-cell--selected");
    expect(selected).not.toBeNull();
    expect(selected?.textContent).toContain("15");
  });

  it("calls onSelect with the clicked date", () => {
    const onSelect = vi.fn();
    render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={onSelect}
        initialYear={2026}
        initialMonth={4}
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^20$/ }));
    expect(onSelect).toHaveBeenCalledWith("2026-05-20");
  });

  it("renders workload dots from dayCounts (one dot per appointment)", () => {
    const { container } = render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={() => {}}
        initialYear={2026}
        initialMonth={4}
        dayCounts={{ "2026-05-15": 3 }}
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    const dots = container.querySelectorAll(".ac-day-cell--selected .ac-day-dot");
    expect(dots.length).toBe(3);
  });

  it("advances the month when the next button is clicked", () => {
    render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={() => {}}
        initialYear={2026}
        initialMonth={4}
        locale="en-US"
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(/June/i)).toBeInTheDocument();
  });

  it("renders at least 35 day cells (current month visible)", () => {
    const { container } = render(
      <MonthCalendar
        selected="2026-05-15"
        onSelect={() => {}}
        initialYear={2026}
        initialMonth={4}
        labels={{ today: "Today", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] }}
      />,
    );
    const cells = container.querySelectorAll(".ac-day-cell, .ac-day-cell--blank");
    expect(cells.length).toBeGreaterThanOrEqual(35);
  });
});
