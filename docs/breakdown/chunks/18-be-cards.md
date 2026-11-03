# Backend cards & card ordering

| | |
|---|---|
| ID | `be-cards` |
| Area | Backend |
| Size | M |
| Wave | 4 |
| Depends on | `be-boards` (boards, columns and the ordering approach) |
| Unlocks | `be-labels` |

## Goal
Cards inside columns with CRUD, moves within a column and across columns, and a position scheme that stays consistent under reordering.

## In scope
- Cards: create, get, update (title, description, …), delete within a column
- Move a card within its column
- Move a card to another column at a target position
- Position scheme that stays consistent under repeated moves
- Ownership checks

## Out of scope
- Labels on cards (`be-labels`)
- Import/export (`be-import-export`)

## Builds on
- `be-boards`: boards, columns and the ordering approach

## Provides
- Card persistence and move operations used by drag & drop on both clients

## Done when
- Integration tests cover card CRUD, same-column and cross-column moves, order consistency after many moves, and ownership isolation

## Decisions from the breakdown
- Card reordering is driven by drag & drop on clients; the backend just needs reliable move operations.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Position scheme (dense integer reindexing vs. fractional/lexorank) and rebalancing
- Transactional guarantees for cross-column moves
- Card fields beyond title/description (decided in contract)
- Optimistic locking / version field?
