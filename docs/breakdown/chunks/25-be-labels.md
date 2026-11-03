# Backend labels

| | |
|---|---|
| ID | `be-labels` |
| Area | Backend |
| Size | S |
| Wave | 5 |
| Depends on | `be-cards` (cards to attach labels to) |
| Unlocks | `be-import-export` |

## Goal
User-defined labels (CRUD) and attaching/detaching labels to cards; cards return their labels.

## In scope
- Labels per user: create, list, rename/recolor, delete
- Attach/detach labels to/from cards
- Cards include their labels in reads

## Out of scope
- Client-side label filtering (client search chunks)

## Builds on
- `be-cards`: cards to attach labels to

## Provides
- Labels model included in the board export

## Done when
- Integration tests cover label CRUD, attach/detach, delete-cascades from cards, and ownership isolation

## Decisions from the breakdown
- Labels are user-defined and private per user (user decision).

## Open questions for the deep-dive session
- Labels scoped per user (all boards) or per board?
- Label attributes (name, color palette?)
- Unique names?
- Max labels per card
