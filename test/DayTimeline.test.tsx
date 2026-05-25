import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayTimeline } from "../src/styled/DayTimeline";
import type { Appointment } from "../src/types";

const appt = (id: string, start: string, duration: number, date = "2026-05-26"): Appointment => ({
  id, date, start_time: start, duration,
});

const labels = {
  today: "Today",
  weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as [string, string, string, string, string, string, string],
};

describe("DayTimeline", () => {
  it("renders work hours by default (9–20)", () => {
    render(<DayTimeline date="2026-05-26" appointments={[]} labels={labels} />);
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  it("does not render early hours unless expanded", () => {
    render(<DayTimeline date="2026-05-26" appointments={[]} labels={labels} />);
    expect(screen.queryByText("07:00")).not.toBeInTheDocument();
  });

  it("expands early hours when the toggle is clicked", () => {
    render(<DayTimeline date="2026-05-26" appointments={[]} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: /Show early hours/i }));
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();
  });

  it("expands late hours when the toggle is clicked", () => {
    render(<DayTimeline date="2026-05-26" appointments={[]} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: /Show late hours/i }));
    expect(screen.getByText("21:00")).toBeInTheDocument();
    expect(screen.getByText("23:00")).toBeInTheDocument();
  });

  it("calls onSlotClick with HH:MM when an empty slot is clicked", () => {
    const onSlotClick = vi.fn();
    const { container } = render(
      <DayTimeline date="2026-05-26" appointments={[]} onSlotClick={onSlotClick} labels={labels} />,
    );
    const buttons = container.querySelectorAll(".ac-empty-slot");
    fireEvent.click(buttons[0]);
    expect(onSlotClick).toHaveBeenCalledWith("09:00");
  });

  it("renders one appointment block per appointment that starts in a visible hour", () => {
    const appts = [appt("a", "10:30", 60)];
    const { container } = render(
      <DayTimeline date="2026-05-26" appointments={appts} labels={labels} />,
    );
    const blocks = container.querySelectorAll(".ac-appointment-block");
    expect(blocks.length).toBe(1);
  });

  it("renderAppointment is called with the appointment object", () => {
    const renderAppointment = vi.fn(() => <span data-testid="rendered" />);
    render(
      <DayTimeline
        date="2026-05-26"
        appointments={[appt("a", "10:00", 60)]}
        renderAppointment={renderAppointment}
        labels={labels}
      />,
    );
    expect(renderAppointment).toHaveBeenCalled();
    expect(screen.getByTestId("rendered")).toBeInTheDocument();
  });

  it("does not render now-line when date is not today", () => {
    const { container } = render(
      <DayTimeline date="1999-01-01" appointments={[]} labels={labels} />,
    );
    expect(container.querySelector(".ac-now-line")).toBeNull();
  });
});
