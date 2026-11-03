# Mobile board import/export

| | |
|---|---|
| ID | `mob-import-export` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 4 |
| Depends on | `mob-board-list` (board list/menus that host the actions) |
| Unlocks | `mob-integration` |

## Goal
Export a board as a JSON file and import one via platform file pickers/share sheets on Android and iOS, with blocking progress and error handling.

## In scope
- Export a board to a JSON file (save/share) on Android and iOS
- Import a JSON file via the platform file picker and create the board
- Blocking progress UI and error handling (invalid file, too large)
- Platform-specific file access via expect/actual

## Out of scope
- Async import jobs (not wanted)

## Builds on
- `mob-board-list`: board list/menus that host the actions

## Provides
- Import/export on mobile

## Done when
- Export produces a JSON file and import creates a board from a file, on both platforms against the fake API

## Decisions from the breakdown
- One blocking request each for upload and download (user decision).

## Open questions for the deep-dive session
- Share sheet vs. save-to-files for export
- File picker library vs. custom expect/actual
- Navigate to the imported board afterwards?
