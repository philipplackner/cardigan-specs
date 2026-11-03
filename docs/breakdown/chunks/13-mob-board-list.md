# Mobile board list

| | |
|---|---|
| ID | `mob-board-list` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 3 |
| Depends on | `mob-fake-api` (board data source), `mob-design-system` (list and dialog components) |
| Unlocks | `mob-import-export` |

## Goal
Board overview: list boards, create, rename and delete, with loading/empty/error states and intentional refresh.

## In scope
- Board overview list
- Create, rename, delete board
- Loading, empty and error states
- Intentional refresh (pull to refresh)
- Navigation to the board view

## Out of scope
- Board contents (`mob-board-view`)
- Import/export actions (`mob-import-export`)

## Builds on
- `mob-fake-api`: board data source
- `mob-design-system`: list and dialog components

## Provides
- Entry screen into boards; host for import/export actions

## Done when
- Board list flows work against the fake API on Android and iOS, phone and tablet

## Decisions from the breakdown
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- List vs. grid on tablets
- Delete confirmation UX
