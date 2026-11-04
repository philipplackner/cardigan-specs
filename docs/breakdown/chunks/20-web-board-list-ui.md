# Web board list UI

| | |
|---|---|
| ID | `web-board-list-ui` |
| Area | Web |
| Size | S |
| Wave | 3 |
| Depends on | `web-design-system` (list and dialog components) |
| Unlocks | `web-boards-connect` |

## Goal
Board overview with create, rename and delete, loading/empty/error states, intentional refresh, and the boards repository interface.

## In scope
- Board overview
- Create, rename, delete board (name and key per `domain-board`)
- Loading, empty and error states
- Intentional refresh
- Boards repository interface
- Host slots for import/export actions

## Out of scope
- Board contents (`web-board-view-ui`)
- Import/export flows (`web-import-export-ui`)

## Builds on
- `web-design-system`: list and dialog components
- Core domain models from scaffolding

## Provides
- Entry screen into boards, repository interface boards-connect implements

## Done when
- Board list shows every state from phone to desktop widths
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- List vs. grid on wide screens
- Delete confirmation UX
