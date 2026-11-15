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
- Host slot for the import action (export lives in the board view)

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
- The New board key field reuses the board key error strings and the local key check that web import/export defines (user decision). They currently live in cardigan-frontend's `transfer` namespace (`src/features/transfer/i18n/en.json`, key group `clash.keyErrors`). `boards` and `transfer` can't import each other, so this chunk moves the strings into `common` or a core namespace and the check into core/utils. A new core module needs the user's approval. Strings:
  - `REQUIRED`: "Enter a key."
  - `TOO_SHORT`: "Use at least 2 letters."
  - `TOO_LONG`: "Use at most 5 letters."
  - `INVALID_FORMAT`: "Use only the letters A–Z." Any other key field error code shows this message too.
  - `ALREADY_USED`: "You already have a board with the key {key}." (from Figma)
- Local key check order: empty → `REQUIRED`, fewer than 2 letters → `TOO_SHORT`, more than 5 → `TOO_LONG`, otherwise any character outside `A`–`Z` → `INVALID_FORMAT` (user decision).

## Open questions for the deep-dive session
- List vs. grid on wide screens
- Delete confirmation UX
