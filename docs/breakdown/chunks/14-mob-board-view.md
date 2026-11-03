# Mobile board view

| | |
|---|---|
| ID | `mob-board-view` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-fake-api` (board/column/card data), `mob-design-system` (components and adaptive layout primitives) |
| Unlocks | `mob-card-detail`, `mob-card-dnd` |

## Goal
Board screen showing columns and cards with layouts per screen size (phone and tablet), column create/rename/delete, column move buttons, and intentional refresh.

## In scope
- Board screen with columns and their cards (read-only card tiles)
- Layouts per screen size (e.g. paged/horizontal columns on phones, side-by-side on tablets)
- Column create, rename, delete
- Column move buttons
- Intentional refresh, loading/error states

## Out of scope
- Card editing (`mob-card-detail`)
- Card drag & drop (`mob-card-dnd`)
- Labels on cards (`mob-labels`)

## Builds on
- `mob-fake-api`: board/column/card data
- `mob-design-system`: components and adaptive layout primitives

## Provides
- Board screen structure that card detail, drag & drop, labels and search hook into

## Done when
- A seeded fake board renders correctly on phone and tablet on both platforms
- Column CRUD and move buttons work against the fake API

## Decisions from the breakdown
- Columns are reordered via move buttons, not drag & drop (user decision).
- Phone + tablet adaptive layouts (user decision).
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Exact phone layout (one column per page vs. horizontal scroll)
- Where column actions live (menu vs. header buttons)
- Card tile content
