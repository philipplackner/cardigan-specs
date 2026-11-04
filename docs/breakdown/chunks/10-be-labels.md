# Backend labels

| | |
|---|---|
| ID | `be-labels` |
| Area | Backend |
| Size | S |
| Wave | 3 |
| Depends on | `be-common` (current-user principal, error model, validation) |
| Unlocks | `be-cards`, `mob-labels-connect`, `web-labels-connect` |

## Goal
User-defined labels with CRUD, case-insensitive unique names and palette colors.

## In scope
- Labels per user: create, list, rename, recolor, delete
- Case-insensitive unique names, palette colors per `domain-label`
- Ownership isolation

## Out of scope
- Attaching labels to cards and removing them on delete (`be-cards`)

## Builds on
- `be-common`: principal, error model, validation

## Provides
- Label persistence `be-cards` attaches to cards
- Endpoints `*-labels-connect` generate from

## Done when
- Integration tests cover label CRUD, name uniqueness, palette validation and ownership isolation

## Decisions from the breakdown
- Shared domain rules (ids, ownership, keys, card numbering, palette, dense positions, last write wins, cascading deletes, text limits) are settled in the shared specs; implement them, don't redecide them.

## Open questions for the deep-dive session
- Palette representation on the wire (names vs. ids)
