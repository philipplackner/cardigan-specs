# Mobile board view UI

| | |
|---|---|
| ID | `mob-board-view-ui` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-design-system` (components and adaptive layout primitives) |
| Unlocks | `mob-boards-connect`, `mob-card-dnd`, `mob-search-filter` |

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
- Card editing (`mob-card-detail-ui`)
- Drag & drop (`mob-card-dnd`)
- Search & filter (`mob-search-filter`)

## Builds on
- `mob-design-system`: components and layout primitives
- Core domain models from scaffolding

## Provides
- Board screen structure that drag & drop, search & filter and card detail hook into

## Done when
- A sample board renders correctly on Android and iOS, phone and tablet
- Column actions work in ViewModel tests against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Columns are reordered via move buttons, not drag & drop (user decision).

## Open questions for the deep-dive session
- Phone layout (one column per page vs. horizontal scroll)
- Where column actions live
- Card tile content
