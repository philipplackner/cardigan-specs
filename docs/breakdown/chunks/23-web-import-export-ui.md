# Web import/export UI & file handling

| | |
|---|---|
| ID | `web-import-export-ui` |
| Area | Web |
| Size | S |
| Wave | 3 |
| Depends on | `web-design-system` (dialogs, progress states) |
| Unlocks | `web-import-export-connect` |

## Goal
Export download and import upload actions with blocking progress and error states.

## In scope
- Export download and import upload actions
- Blocking progress and error states
- Import/export repository interface

## Out of scope
- Real upload/download (`web-import-export-connect`)

## Builds on
- `web-design-system`: dialogs, progress states

## Provides
- File handling and UI that import-export-connect wires to the backend

## Done when
- A JSON file can be picked and downloaded
- Progress and error states show correctly; tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- One blocking request each way (user decision).

## Open questions for the deep-dive session
- Drag-and-drop file upload area?
- Export file naming
