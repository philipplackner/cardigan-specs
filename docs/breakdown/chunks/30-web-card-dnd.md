# Web card drag & drop

| | |
|---|---|
| ID | `web-card-dnd` |
| Area | Web |
| Size | M |
| Wave | 4 |
| Depends on | `web-board-view-ui` (column and card layout to drag within) |
| Unlocks | `web-cards-connect` |

## Goal
Drag & drop of cards within and across columns with auto-scroll and drop indicators, emitting moves through the cards repository interface with rollback on failure.

## In scope
- Drag of cards within and across columns (mouse and touch, keyboard alternative)
- Auto-scroll and drop indicators
- Emitting moves through the cards repository interface, rollback on failure
- Works in all layouts

## Out of scope
- Column drag & drop (columns use move buttons)
- Persisting moves against the backend (`web-cards-connect`)

## Builds on
- `web-board-view-ui`: board layout

## Provides
- Card reordering interaction that cards-connect persists

## Done when
- Cards can be dragged within and across columns from phone to desktop widths
- Failed moves roll back in tests

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Cards are reordered by drag & drop (user decision).

## Open questions for the deep-dive session
- Library choice (dnd-kit, pragmatic-drag-and-drop, …)
- Cross-column dragging on phones
- Accessibility approach
