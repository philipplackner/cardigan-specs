# Backend boards & columns

| | |
|---|---|
| ID | `be-boards` |
| Area | Backend |
| Size | M |
| Wave | 3 |
| Depends on | `be-common` (current-user principal, users table, error model, validation) |
| Unlocks | `be-cards`, `mob-boards-connect`, `web-boards-connect` |

## Goal
Per-user boards and their columns with CRUD, board keys, column ordering and ownership scoping.

## In scope
- Boards: create, list, get, rename, delete per user, incl. immutable keys unique per user
- Columns: create, rename, delete, list within a board
- Column moves with dense positions
- Board updated time following column changes
- Ownership: other users' boards are not found

## Out of scope
- Cards (`be-cards`)
- Labels (`be-labels`)
- Import/export (`be-import-export`)

## Builds on
- `be-common`: principal, users table, error model

## Provides
- Board and column persistence that cards hang off
- Endpoints `*-boards-connect` generate from

## Done when
- Integration tests cover board and column CRUD, key rules, column moves and ownership isolation per the shared specs

## Decisions from the breakdown
- Shared domain rules (ids, ownership, keys, card numbering, palette, dense positions, last write wins, cascading deletes, text limits) are settled in the shared specs; implement them, don't redecide them.
- Columns are reordered by move buttons on clients; the API needs explicit column moves.

## Open questions for the deep-dive session
- Board read shape (with or without columns/cards)
- Column move API (to index vs. left/right)
