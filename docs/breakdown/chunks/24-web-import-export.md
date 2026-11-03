# Web board import/export

| | |
|---|---|
| ID | `web-import-export` |
| Area | Web |
| Size | S |
| Wave | 4 |
| Depends on | `web-board-list` (board actions host) |
| Unlocks | `web-integration` |

## Goal
Download a board as a JSON file and import one via file upload, with blocking progress and error handling.

## In scope
- Download a board as a JSON file
- Upload a JSON file to create a board
- Blocking progress and error handling

## Out of scope
- Async import jobs (not wanted)

## Builds on
- `web-board-list`: board actions host

## Provides
- Import/export on web

## Done when
- Export downloads a JSON file and import creates a board from it against the fake API

## Decisions from the breakdown
- One blocking request each way (user decision).

## Open questions for the deep-dive session
- Drag-and-drop file upload area?
- File naming of exports
- Navigate to the imported board afterwards?
