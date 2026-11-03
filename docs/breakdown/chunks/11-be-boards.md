# Backend boards & columns

| | |
|---|---|
| ID | `be-boards` |
| Area | Backend |
| Size | M |
| Wave | 3 |
| Depends on | `be-auth` (current-user principal and users table for ownership) |
| Unlocks | `be-cards` |

## Goal
Per-user boards and their columns with CRUD, column reordering and ownership scoping.

## In scope
- Boards: create, list, get, rename, delete (per user)
- Columns: create, rename, delete, list within a board
- Column reordering (move left/right or to index)
- Ownership checks on every operation
- Board read shape per contract

## Out of scope
- Cards and card ordering (`be-cards`)
- Labels (`be-labels`)
- Import/export (`be-import-export`)

## Builds on
- `be-auth`: current-user principal and users table for ownership

## Provides
- Board and column persistence and services that cards hang off
- Ordering approach reused for cards

## Done when
- Integration tests cover board/column CRUD, column ordering and that users can't see or change others' boards

## Decisions from the breakdown
- Boards and labels are private per user; no sharing or members in v1.
- Columns are reordered by move buttons on clients, so the API needs explicit column moves, no drag & drop specifics.

## Open questions for the deep-dive session
- Delete semantics (cascade columns/cards, soft delete?)
- Column position scheme (shared with cards)
- Limits (max boards/columns, name lengths)
- Concurrency: what if two devices reorder at once (last write wins?)
