# Web board view UI

| | |
|---|---|
| ID | `web-board-view-ui` |
| Area | Web |
| Size | M |
| Wave | 3 |
| Depends on | `web-design-system` (components and adaptive layout primitives) |
| Unlocks | `web-boards-connect`, `web-card-dnd`, `web-search-filter` |

## Goal
Board screen with columns and card tiles, layouts per screen size, column create/rename/delete, column move buttons and intentional refresh.

## In scope
- Board screen with columns and card tiles (incl. display IDs and label chips)
- Layouts per screen size
- Column create, rename, delete
- Column move buttons
- Intentional refresh, loading/error states
- Board/column repository interface

## Out of scope
- Card editing (`web-card-detail-ui`)
- Drag & drop (`web-card-dnd`)
- Search & filter (`web-search-filter`)

## Builds on
- `web-design-system`: components and layout primitives
- Core domain models from scaffolding

## Provides
- Board screen structure that drag & drop, search & filter and card detail hook into

## Done when
- A sample board renders correctly from phone to desktop widths
- Column actions work in ViewModel tests against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Columns are reordered via move buttons, not drag & drop (user decision).

## Open questions for the deep-dive session
- Phone layout (one column per page vs. horizontal scroll)
- Where column actions live
- Card tile content
