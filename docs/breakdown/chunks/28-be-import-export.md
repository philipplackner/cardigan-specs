# Backend board import/export

| | |
|---|---|
| ID | `be-import-export` |
| Area | Backend |
| Size | M |
| Wave | 6 |
| Depends on | `be-labels` (complete domain model (boards, columns, cards, labels) to serialize) |
| Unlocks | `mob-integration`, `web-integration` |

## Goal
Blocking download of a complete board as JSON (columns, cards, labels, order) and blocking upload that validates the file and recreates the board for the current user.

## In scope
- Blocking download of one board as a JSON file in the contract's format
- Blocking upload that validates the file and recreates the board for the current user
- Mapping of labels on import
- Size limits and validation errors

## Out of scope
- Async/background import jobs (explicitly not wanted)
- Importing from other tools' formats (e.g. Trello)

## Builds on
- `be-labels`: complete domain model (boards, columns, cards, labels) to serialize

## Provides
- Import/export endpoints used by both clients' integration chunks

## Done when
- Round-trip test: export, import into another account, boards are equivalent
- Invalid or oversized files are rejected with contract errors
- Import is atomic (all or nothing)

## Decisions from the breakdown
- One blocking request each for upload and download (user decision).
- Export format is JSON for a complete board.

## Open questions for the deep-dive session
- Multipart upload vs. raw JSON body
- Max file size
- Label conflict handling on import (match by name vs. create new)
- Name clashes with existing boards
- Schema version handling for older exports
