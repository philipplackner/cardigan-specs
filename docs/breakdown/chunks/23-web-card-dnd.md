# Web card drag & drop

| | |
|---|---|
| ID | `web-card-dnd` |
| Area | Web |
| Size | M |
| Wave | 4 |
| Depends on | `web-board-view` (column and card layout) |
| Unlocks | `web-integration` |

## Goal
Mouse and touch drag & drop of cards within and across columns, persisting moves and rolling back on failure.

## In scope
- Mouse and touch drag & drop of cards within and across columns
- Auto-scroll, drop indicators
- Persist moves, roll back on failure
- Keyboard alternative

## Out of scope
- Column drag & drop (move buttons instead)

## Builds on
- `web-board-view`: column and card layout

## Provides
- Card reordering on web

## Done when
- Cards can be dragged within and across columns with mouse and touch on all breakpoints; failed moves roll back

## Decisions from the breakdown
- Cards are reordered by drag & drop (user decision).

## Open questions for the deep-dive session
- Library choice (dnd-kit, pragmatic-drag-and-drop, …)
- Cross-column dragging on phone layout
- Accessibility approach
