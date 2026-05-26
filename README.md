# @chiliec/appointment-calendar

React month-grid calendar + daily timeline components for appointment booking UIs.

## Install

```bash
pnpm add @chiliec/appointment-calendar
# or: npm install @chiliec/appointment-calendar
```

Peer deps: `react@^19`, `react-dom@^19`.

## Quick start (styled layer)

Import the stylesheet once in your app entry:

```ts
import "@chiliec/appointment-calendar/styles.css";
```

Then use the components:

```tsx
import { useState } from "react";
import {
  MonthCalendar,
  DayTimeline,
} from "@chiliec/appointment-calendar/styled";

const LABELS = {
  today: "Today",
  weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const,
};

export function MyScheduler() {
  const [date, setDate] = useState("2026-05-26");
  const appointments = [
    { id: "1", date: "2026-05-26", start_time: "10:00", duration: 60 },
  ];
  const dayCounts = { "2026-05-26": appointments.length };

  return (
    <>
      <MonthCalendar
        selected={date}
        onSelect={setDate}
        dayCounts={dayCounts}
        labels={LABELS}
      />
      <DayTimeline
        date={date}
        appointments={appointments}
        onSlotClick={(time) => console.log("clicked", time)}
        labels={LABELS}
      />
    </>
  );
}
```

## Headless layer

For full UI control, use the hooks and utilities directly:

```ts
import {
  useMonthGrid,
  useDayTimeline,
  findConflicts,
  buildMonthGrid,
  timeToMinutes,
} from "@chiliec/appointment-calendar";
```

## Theming

The styled layer uses CSS variables on `.ac-root`. Override any of them on a parent element to re-theme:

```css
.my-app .ac-root {
  --ac-bg: #fffbef;
  --ac-fg: #5f471d;
  --ac-accent: #ffdea3;
  --ac-radius: 1rem;
}
```

Class names are prefixed `.ac-` — see `src/styled/styles.css` for the full list.

## API

### `<MonthCalendar />`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `selected` | `string` (YYYY-MM-DD) | yes | Currently selected date |
| `onSelect` | `(date) => void` | yes | |
| `dayCounts` | `Record<string, number>` | no | Workload dots per day |
| `initialYear` / `initialMonth` | `number` | no | Defaults to today; month is 0-indexed |
| `locale` | `string` | no | BCP-47, default `"en-US"` |
| `onMonthChange` | `(year, month) => void` | no | Fires after prev/next/today nav. Useful for refetching workload counts. Not fired on mount. |
| `labels` | `Labels` | yes | See "Labels" below |

### `<DayTimeline<T> />`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `date` | `string` (YYYY-MM-DD) | yes | |
| `appointments` | `T[]` (T extends Appointment) | yes | |
| `workStart` / `workEnd` | `number` | no | Default 9 / 21 |
| `onSlotClick` | `(time: "HH:MM") => void` | no | |
| `renderAppointment` | `(apt: T) => ReactNode` | no | |
| `getDisplayDuration` | `(apt: T) => number` | no | For cleanup buffer, etc. |
| `labels` | `Labels` | yes | |

### `Labels`

```ts
interface Labels {
  today: string;
  weekdays: [string, string, string, string, string, string, string]; // Mo..Su
  monthYear?: (year, month) => string;
  appointmentsCount?: (n) => string;
  showEarlyHours?: (workStart) => string;
  hideEarlyHours?: string;
  showLateHours?: (workEnd) => string;
  hideLateHours?: string;
  schedule?: string;
  loading?: string;
}
```

## License

MIT
