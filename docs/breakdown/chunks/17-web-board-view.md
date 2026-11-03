# Web board view

| | |
|---|---|
| ID | `web-board-view` |
| Area | Web |
| Size | M |
| Wave | 3 |
| Depends on | `web-fake-api` (board/column/card data), `web-design-system` (components and breakpoints) |
| Unlocks | `web-card-detail`, `web-card-dnd` |

## Goal
Board screen showing columns and cards with layouts per screen size (phone to desktop widths), column create/rename/delete, column move buttons, and intentional refresh.

## In scope
- Board page with columns and card tiles
- Layouts per breakpoint (single-column/swipe on phones, side by side with horizontal scroll on wider screens)
- Column create, rename, delete
- Column move buttons
- Refresh, loading/error states

## Out of scope
- Card editing (`web-card-detail`)
- Drag & drop (`web-card-dnd`)
- Labels (`web-labels`)

## Builds on
- `web-fake-api`: board/column/card data
- `web-design-system`: components and breakpoints

## Provides
- Board page structure that card detail, drag & drop, labels and search hook into

## Done when
- A seeded fake board renders correctly from phone to desktop
- Column CRUD and move buttons work against the fake API

## Decisions from the breakdown
- Columns reordered via move buttons (user decision).
- Fully responsive (user decision).
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Phone layout details
- Keyboard accessibility of column actions
- Card tile content
