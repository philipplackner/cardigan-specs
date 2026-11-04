# Backend cards, ordering & card labels

| | |
|---|---|
| ID | `be-cards` |
| Area | Backend |
| Size | M |
| Wave | 4 |
| Depends on | `be-boards` (boards, columns and the ordering implementation), `be-labels` (labels to attach) |
| Unlocks | `be-import-export`, `mob-cards-connect`, `web-cards-connect` |

## Goal
Cards inside columns with CRUD, per-board numbering, moves within and across columns, and attaching/detaching labels; deleting a label removes it from cards.

## In scope
- Cards: create, get, update, delete within a column
- Per-board card numbering, never reused
- Moves within a column and across columns with dense positions
- Attach/detach labels; cards return their labels sorted by name
- Deleting a label removes it from all cards; deleting a column removes its cards
- Board updated time follows card changes

## Out of scope
- Import/export (`be-import-export`)

## Builds on
- `be-boards`: board/column persistence and ordering
- `be-labels`: label persistence

## Provides
- Card and move endpoints both clients' cards-connect and drag & drop rely on

## Done when
- Integration tests cover card CRUD, numbering, same- and cross-column moves, label attach/detach, cascades and ownership isolation

## Decisions from the breakdown
- Shared domain rules (ids, ownership, keys, card numbering, palette, dense positions, last write wins, cascading deletes, text limits) are settled in the shared specs; implement them, don't redecide them.
- Card reordering is driven by drag & drop on clients; the backend needs reliable move operations.

## Open questions for the deep-dive session
- Transactional guarantees for cross-column moves
- Card move API shape
- Labels set via full replace vs. attach/detach calls
