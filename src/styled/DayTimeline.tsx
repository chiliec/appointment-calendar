import { Fragment, ReactNode, useState } from "react";
import type { Appointment, Labels } from "../types";
import { useDayTimeline } from "../headless/useDayTimeline";
import { timeToMinutes } from "../headless/utils";

const SLOT_HEIGHT = 64;

export interface DayTimelineProps<T extends Appointment> {
  /** Selected date as "YYYY-MM-DD" */
  date: string;
  appointments: T[];
  /** Hour at which the work day begins (inclusive). Default 9. */
  workStart?: number;
  /** Hour at which the work day ends (exclusive). Default 21. */
  workEnd?: number;
  /** Called when an empty slot is clicked. Passes start time as "HH:MM". */
  onSlotClick?: (timeHHMM: string) => void;
  /** Render-prop for the appointment block contents. */
  renderAppointment?: (apt: T) => ReactNode;
  /** Compute the displayed total duration (including any visual buffer). Defaults to `apt.duration`. */
  getDisplayDuration?: (apt: T) => number;
  labels: Labels;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function DayTimeline<T extends Appointment>(props: DayTimelineProps<T>) {
  const {
    date,
    appointments,
    workStart = 9,
    workEnd = 21,
    onSlotClick,
    renderAppointment,
    getDisplayDuration,
    labels,
  } = props;

  const [showEarly, setShowEarly] = useState(false);
  const [showLate, setShowLate] = useState(false);

  const t = useDayTimeline({ date, appointments, workStart, workEnd });

  const showEarlyText = labels.showEarlyHours
    ? labels.showEarlyHours(workStart)
    : `Show early hours (00:00–${pad(workStart)}:00)`;
  const showLateText = labels.showLateHours
    ? labels.showLateHours(workEnd)
    : `Show late hours (${pad(workEnd)}:00–24:00)`;
  const hideEarlyText = labels.hideEarlyHours ?? "Hide early hours";
  const hideLateText = labels.hideLateHours ?? "Hide late hours";

  return (
    <section className="ac-root">
      {labels.schedule && <h2 className="ac-timeline-title">{labels.schedule}</h2>}

      <div className="ac-timeline-stack">
        {!showEarly && (
          <button
            type="button"
            onClick={() => setShowEarly(true)}
            className="ac-timeline-toggle"
            aria-label="Show early hours"
          >
            {showEarlyText}
            {t.hasEarlyAppointments && (
              <span className="ac-timeline-toggle-badge">{t.earlyAppointmentsCount}</span>
            )}
          </button>
        )}

        {showEarly && (
          <Fragment>
            {t.earlyHours.map((h) => (
              <Slot
                key={h}
                hour={h}
                appointments={appointments}
                onClick={onSlotClick}
                nowLineMinutes={t.nowLineMinutes}
                renderAppointment={renderAppointment}
                getDisplayDuration={getDisplayDuration}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowEarly(false)}
              className="ac-timeline-toggle"
            >
              {hideEarlyText}
            </button>
          </Fragment>
        )}

        {t.workHours.map((h) => (
          <Slot
            key={h}
            hour={h}
            appointments={appointments}
            onClick={onSlotClick}
            nowLineMinutes={t.nowLineMinutes}
            renderAppointment={renderAppointment}
            getDisplayDuration={getDisplayDuration}
          />
        ))}

        {!showLate && (
          <button
            type="button"
            onClick={() => setShowLate(true)}
            className="ac-timeline-toggle"
            aria-label="Show late hours"
          >
            {showLateText}
            {t.hasLateAppointments && (
              <span className="ac-timeline-toggle-badge">{t.lateAppointmentsCount}</span>
            )}
          </button>
        )}

        {showLate && (
          <Fragment>
            {t.lateHours.map((h) => (
              <Slot
                key={h}
                hour={h}
                appointments={appointments}
                onClick={onSlotClick}
                nowLineMinutes={t.nowLineMinutes}
                renderAppointment={renderAppointment}
                getDisplayDuration={getDisplayDuration}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowLate(false)}
              className="ac-timeline-toggle"
            >
              {hideLateText}
            </button>
          </Fragment>
        )}
      </div>
    </section>
  );
}

interface SlotProps<T extends Appointment> {
  hour: number;
  appointments: T[];
  onClick?: (timeHHMM: string) => void;
  nowLineMinutes: number | null;
  renderAppointment?: (apt: T) => ReactNode;
  getDisplayDuration?: (apt: T) => number;
}

function Slot<T extends Appointment>(props: SlotProps<T>) {
  const { hour, appointments, onClick, nowLineMinutes, renderAppointment, getDisplayDuration } = props;
  const slotStart = hour * 60;
  const slotEnd = slotStart + 60;

  const startsHere = appointments.filter((a) => {
    const s = timeToMinutes(a.start_time);
    return s >= slotStart && s < slotEnd;
  });

  const showNow =
    nowLineMinutes !== null && nowLineMinutes >= slotStart && nowLineMinutes < slotEnd;
  const nowTopPx = showNow ? ((nowLineMinutes! - slotStart) / 60) * SLOT_HEIGHT : 0;

  return (
    <div className="ac-timeline-slot">
      <div className="ac-hour-label">
        {pad(hour)}:00
        {showNow && <span className="ac-hour-label-now-dot" style={{ top: nowTopPx }} aria-hidden />}
      </div>
      <div className="ac-timeline-body">
        {showNow && <div className="ac-now-line" style={{ top: nowTopPx }} aria-hidden />}
        {startsHere.map((apt) => {
          const aptStart = timeToMinutes(apt.start_time);
          const offsetMin = aptStart - slotStart;
          const displayMin = getDisplayDuration ? getDisplayDuration(apt) : apt.duration;
          const topPx = (offsetMin / 60) * SLOT_HEIGHT;
          const heightPx = Math.max((displayMin / 60) * SLOT_HEIGHT, 40);
          return (
            <div
              key={apt.id}
              className="ac-appointment-block"
              style={{ top: topPx, height: heightPx }}
            >
              {renderAppointment ? renderAppointment(apt) : <span>{apt.start_time}</span>}
            </div>
          );
        })}
        {startsHere.length === 0 && (
          <button
            type="button"
            className="ac-empty-slot"
            onClick={() => onClick?.(`${pad(hour)}:00`)}
            aria-label={`Add appointment at ${pad(hour)}:00`}
          />
        )}
      </div>
    </div>
  );
}
