# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-30

### Added

- `generateSlots(options)` (headless) — builds the bookable start-time grid for a
  single day. Steps a fixed `step`-minute grid from `workStart` to `workEnd`
  (a slot is offered while its session ends by `workEnd`; the trailing `buffer`
  may spill past close) and delegates all overlap math to `findConflicts`.
  Returns every candidate in order as `Slot[]` —
  `{ time: "HH:MM"; available: boolean; conflictIds: string[] }` — so taken
  slots can be rendered greyed-out. Parameterized by primitives
  (`duration` + `buffer`/`getBuffer`), keeping the library project-agnostic.
- `minutesToTime(mins)` utility — the inverse of `timeToMinutes`.
- Exported types `GenerateSlotsOptions` and `Slot`.

## [0.3.0] - 2026-05-27

### Added

- Opt-in cleanup buffer in `findConflicts` via `buffer` and per-appointment
  `getBuffer` options. Defaults keep cleanup non-blocking, so back-to-back
  bookings remain allowed.

## [0.2.0] - 2026-05-26

### Added

- `onMonthChange` callback on `MonthCalendar`, fired after prev/next/today
  navigation (useful for refetching workload counts). Not fired on mount.

## [0.1.0] - 2026-05-26

### Added

- Initial release: `MonthCalendar` and `DayTimeline` styled components plus the
  headless layer — `useMonthGrid`, `useDayTimeline`, conflict detection
  (`hasConflict`, `findConflicts`), and date/time utilities (`formatYMD`,
  `buildMonthGrid`, `timeToMinutes`).
- `styles.css` for the styled layer; English labels with i18n overrides.

[0.4.0]: https://github.com/chiliec/appointment-calendar/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/chiliec/appointment-calendar/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/chiliec/appointment-calendar/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/chiliec/appointment-calendar/releases/tag/v0.1.0
