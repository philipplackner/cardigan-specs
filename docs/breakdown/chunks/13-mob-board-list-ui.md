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
- Host slot for the import action (export lives in the board view)

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
- The New board key field reuses the board key error strings and the local key check that `mob-import-export-ui` defines in its transfer feature (CardiganApp change `add-transfer-ui`) (user decision). This chunk moves the strings to `:core:presentation` and the check to `:core:domain`. Strings:
  - `REQUIRED`: "Enter a key."
  - `TOO_SHORT`: "Use at least 2 letters."
  - `TOO_LONG`: "Use at most 5 letters."
  - `INVALID_FORMAT`: "Use only the letters A–Z." Any other key field error code shows this message too.
  - `ALREADY_USED`: "You already have a board with the key {key}." (from Figma)
- Local key check order: empty → `REQUIRED`, fewer than 2 letters → `TOO_SHORT`, more than 5 → `TOO_LONG`, otherwise any character outside `A`–`Z` → `INVALID_FORMAT` (user decision).

## Open questions for the deep-dive session
- List vs. grid on wide screens
- Delete confirmation UX
