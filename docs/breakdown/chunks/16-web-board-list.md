# Web board list

| | |
|---|---|
| ID | `web-board-list` |
| Area | Web |
| Size | S |
| Wave | 3 |
| Depends on | `web-fake-api` (board operations), `web-design-system` (list and dialog components) |
| Unlocks | `web-import-export` |

## Goal
Board overview: list boards, create, rename and delete, with loading/empty/error states and intentional refresh.

## In scope
- Board overview
- Create, rename, delete board
- Loading/empty/error states, intentional refresh
- Navigation to board view

## Out of scope
- Board contents (`web-board-view`)
- Import/export actions (`web-import-export`)

## Builds on
- `web-fake-api`: board operations
- `web-design-system`: list and dialog components

## Provides
- Entry page into boards; host for import/export actions

## Done when
- Board list flows work against the fake API from phone to desktop widths

## Decisions from the breakdown
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Grid vs. list per breakpoint
- Refresh affordance (button)
