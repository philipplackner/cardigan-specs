# Proposal

## Breaking Change

No. No domain specs exist yet, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

Every feature on every platform reads and changes the same users, boards, columns, cards and labels. Without one shared set of domain rules, each feature spec would restate them and platforms could disagree on identity, ordering, limits or what a delete removes.

## What Changes

- Every entity has a backend-assigned UUID. Boards and labels belong to exactly one user. Other users' data is treated as not found.
- Users are identified by a unique email, compared case-insensitively. Passwords follow one composition rule.
- Boards have a name and an immutable key that is unique among the user's boards. Keys can be reused after a board is deleted.
- Cards have a per-board number that is never reused, so display IDs like `CRD-109` are stable. Display IDs are for people only; a card's identity is its UUID. A card never leaves its board.
- Labels are per user, with case-insensitively unique names and one of 20 named palette colors. A card holds a set of labels sorted by name.
- Columns in a board and cards in a column have dense positions 0..n-1.
- Fixed text limits apply to every field, counted as defined in `text-length`. There are no count caps.
- Deletes are permanent and cascade: board → columns → cards; deleting a label removes it from all cards.
- The backend sets UTC created and updated times. A board's updated time follows changes to its columns and cards.
- Concurrent changes follow last write wins. A change to a card that was already deleted fails as not found.

## Capabilities

### New Capabilities
- `domain-user`: Users' email identity, password rule and data ownership.
- `domain-board`: Board fields, key rules, the board's updated time, and what deleting a board removes.
- `domain-column`: Column fields, board membership, and what deleting a column removes.
- `domain-card`: Card fields, per-board numbering, display ID, board membership and label set.
- `domain-label`: Label fields, name uniqueness, color palette, and what deleting a label removes.
- `domain-ordering`: Dense positions for columns and cards, and how concurrent changes resolve without breaking the order.

### Modified Capabilities
- None.
