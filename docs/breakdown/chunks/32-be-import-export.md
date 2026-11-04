# Backend board import/export

| | |
|---|---|
| ID | `be-import-export` |
| Area | Backend |
| Size | M |
| Wave | 5 |
| Depends on | `be-cards` (complete domain model (boards, columns, cards, labels)) |
| Unlocks | `mob-import-export-connect`, `web-import-export-connect` |

## Goal
Blocking download of a complete board as JSON and blocking upload that validates the file and recreates the board for the current user.

## In scope
- Blocking download of one board as JSON in the shared export format
- Blocking upload that validates and recreates the board for the current user
- Label mapping on import
- Size limits and validation errors
- Atomic import

## Out of scope
- Async import jobs (not wanted)
- Other tools' formats

## Builds on
- `be-cards`: the full domain model

## Provides
- Endpoints `*-import-export-connect` generate from

## Done when
- Round-trip test: export, import into another account, boards are equivalent
- Invalid or oversized files rejected with shared-model errors
- Import is all or nothing

## Decisions from the breakdown
- One blocking request each for upload and download (user decision).

## Open questions for the deep-dive session
- Multipart upload vs. raw JSON body
- Max file size
- Board key clashes on import
- Schema version handling
