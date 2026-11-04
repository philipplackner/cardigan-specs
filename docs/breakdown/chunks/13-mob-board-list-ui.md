# Mobile board list UI

| | |
|---|---|
| ID | `mob-board-list-ui` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 3 |
| Depends on | `mob-design-system` (list and dialog components) |
| Unlocks | `mob-boards-connect` |

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
- Board contents (`mob-board-view-ui`)
- Import/export flows (`mob-import-export-ui`)

## Builds on
- `mob-design-system`: list and dialog components
- Core domain models from scaffolding

## Provides
- Entry screen into boards, repository interface boards-connect implements

## Done when
- Board list shows every state on Android and iOS, phone and tablet
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- List vs. grid on wide screens
- Delete confirmation UX
