# Decisions: core-domain-model

Confirmed with Philipp Lackner on 2026-11-03.

## Summary

This change defines Cardigan's core domain rules: the rules about users, boards, columns, cards, labels and ordering that stay true no matter which feature reads or changes the data. It covers identity, ownership, field rules and limits, ordering, card numbering, timestamps, deletion cascades and concurrency. It does not define operations, API shapes, screens or flows; those belong to later feature specs that build on these rules.

## Decisions

### D1 — Scope
- **Question**: What should this domain change define?
- **Decision**: Only plain domain rules that would not change when different features touch that part of the domain. No glossary, no operations, no screens.
- **Alternatives**: Entities + invariants with glossary; glossary + relationships only; full domain including operations.
- **Depends on**: —

### D2 — Spec layout
- **Question**: How are the domain specs organized?
- **Decision**: Flat, one spec per entity: `domain-user`, `domain-board`, `domain-column`, `domain-card`, `domain-label`, plus `domain-ordering`.
- **Alternatives**: One single `domain-model` spec; nested `domain/` folder.
- **Depends on**: D1

### D3 — Identifiers
- **Question**: Which identifiers do entities carry?
- **Decision**: Every entity has an opaque UUID assigned by the backend. Board key and card display ID are separate, human-facing values.
- **Alternatives**: Client-generated UUIDs; server sequential integers.
- **Depends on**: —

### D4 — Platforms and compatibility
- **Question**: Which platforms are targeted, and is the change breaking?
- **Decision**: Backend, Android, iOS and web. Not breaking.
- **Alternatives**: Backend + clients with Android/iOS as one platform.
- **Why**: No domain specs exist yet, so nothing has to migrate.
- **Depends on**: —

### D5 — Ordering
- **Question**: How is the order of columns in a board and cards in a column defined?
- **Decision**: Dense positions: in each container, positions are always 0..n-1 with no gaps or duplicates.
- **Alternatives**: Total order only (representation left to the contract); fractional ranks.
- **Depends on**: D1

### D6 — Card number
- **Question**: How are card numbers assigned?
- **Decision**: Per board, starting at 1, increasing by 1 per new card. Numbers of deleted cards are never reused. A card's number never changes.
- **Alternatives**: Per board reusing gaps; per user global counter.
- **Depends on**: —

### D7 — Deletion
- **Question**: Are deletions permanent?
- **Decision**: Hard delete for boards, columns, cards and labels; deleted data cannot be restored.
- **Alternatives**: Soft delete without restore in v1.
- **Depends on**: —

### D8 — Minimum columns
- **Question**: Can a board have zero columns?
- **Decision**: Yes. The last column can be deleted.
- **Alternatives**: At least one column required.
- **Depends on**: —

### D9 — Label name uniqueness
- **Question**: Must label names be unique within a user's label set?
- **Decision**: Yes, case-insensitive.
- **Alternatives**: Unique case-sensitive; not unique.
- **Depends on**: —

### D10 — Label color sharing
- **Question**: Can two labels share a color?
- **Decision**: Yes.
- **Alternatives**: Color unique per user (caps labels at 20).
- **Depends on**: —

### D11 — Board and column name uniqueness
- **Question**: Must board names or column names be unique?
- **Decision**: Neither is unique.
- **Alternatives**: Column names unique per board; both unique.
- **Depends on**: —

### D12 — Board key reuse
- **Question**: Can a deleted board's key be used again by the same user?
- **Decision**: Yes, immediately. Uniqueness applies only among the user's existing boards.
- **Alternatives**: Never reusable.
- **Depends on**: D7

### D13 — Case-insensitive comparison
- **Question**: How is "case-insensitive" compared?
- **Decision**: Full Unicode default case folding, locale-independent, applied to the normalized text from the text-length spec.
- **Alternatives**: Locale-independent simple lowercase.
- **Depends on**: D9

### D14 — Card board membership
- **Question**: Can a card move to a column in a different board?
- **Decision**: No. A card belongs to one board for its whole life; its number and display ID never change.
- **Alternatives**: Any board of the user, with a new number.
- **Depends on**: D6

### D15 — Timestamps
- **Question**: Which timestamps exist and what bumps a board's updated time?
- **Decision**: Boards, columns, cards and labels have created and updated times, set by the backend in UTC. A board's updated time also changes when any of its columns or cards is created, changed, moved or deleted.
- **Alternatives**: Board updated only on its own fields; timestamps on cards only.
- **Depends on**: —

### D16 — Email identity
- **Question**: How is a user's email treated as identity?
- **Decision**: Unique per account, compared case-insensitively; stored as entered after normalization.
- **Alternatives**: Stored lowercased; case-sensitive.
- **Depends on**: D13

### D17 — Text limits
- **Question**: Which text length limits are domain rules?
- **Decision**: Board name 1–100, column name 1–30, card title 1–200 (all single-line, required); card description 0–10,000 (multi-line, optional); label name 1–30; email up to 254; password 12–128; board key 2–5 letters A–Z. Counted per the text-length spec.
- **Alternatives**: Tighter set; leave to feature specs.
- **Why**: User raised the board name maximum from the proposed 50 to 100.
- **Depends on**: —

### D18 — Count caps
- **Question**: Are there caps on how many items a user or container can have?
- **Decision**: No caps in v1.
- **Alternatives**: Caps per user/board/card; labels per card only.
- **Depends on**: —

### D19 — Concurrency
- **Question**: What happens when two devices change the same item?
- **Decision**: Last write wins, with no version checks. Ordering invariants always hold.
- **Alternatives**: Version conflict on stale edit.
- **Depends on**: D5

### D20 — Labels on a card
- **Question**: How are a card's labels ordered?
- **Decision**: A card has a set of distinct labels with no manual order; they are presented sorted by case-folded name.
- **Alternatives**: Order of attaching.
- **Depends on**: D9, D13

### D21 — Other users' data
- **Question**: What happens when a user references another user's board, column, card or label?
- **Decision**: It is treated exactly like a non-existent ID (not found).
- **Alternatives**: Separate forbidden error.
- **Depends on**: —

### D22 — Board key case
- **Question**: What happens when a board key is submitted with lowercase letters?
- **Decision**: ASCII lowercase letters are uppercased and accepted. Anything other than letters A–Z is rejected.
- **Alternatives**: Rejected.
- **Depends on**: D17

### D23 — Default columns
- **Question**: Where does the "new boards start with To do / In progress / Done" rule belong?
- **Decision**: In the boards feature spec, not in the domain specs.
- **Alternatives**: Domain board spec with an import exception.
- **Depends on**: D1

### D24 — Label edits and updated times
- **Question**: Does renaming or recoloring a label change cards' or boards' updated time?
- **Decision**: No, only the label's own updated time. Attaching or detaching a label updates the card and its board.
- **Alternatives**: Yes, for every card using it and its board.
- **Depends on**: D15

### D25 — Label color value
- **Question**: How is a label color identified?
- **Decision**: By one of 20 fixed palette names: Amber, Blue, Brown, Cyan, Emerald, Fuchsia, Green, Indigo, Lime, Olive, Orange, Pink, Purple, Red, Rose, Sky, Slate, Teal, Violet, Yellow. Each client maps the name to its theme colors.
- **Alternatives**: Hex value.
- **Depends on**: —

### D26 — Empty description
- **Question**: How is a card without a description represented?
- **Decision**: As the empty string; the description is always present.
- **Alternatives**: Absent / null.
- **Depends on**: D17

### D27 — User spec scope
- **Question**: Which user rules go into `domain-user`?
- **Decision**: Email identity and uniqueness, the password composition rule, and data ownership. Tokens, sessions and login flow belong to the auth feature spec.
- **Alternatives**: Identity only.
- **Depends on**: D1, D2

### D28 — Password character classes
- **Question**: What counts as lowercase letter, uppercase letter and digit in passwords?
- **Decision**: Unicode general categories: lowercase = Ll, uppercase = Lu, digit = Nd.
- **Alternatives**: ASCII only.
- **Depends on**: D27

### D29 — Card updated time on moves and label deletion
- **Question**: Do moving a card and deleting a label it carries change the card's updated time?
- **Decision**: Yes. Moving a card to another column changes its updated time. Deleting a label changes the updated time of every card that carried it.
- **Alternatives**: Neither changes it.
- **Why**: User review of the first spec draft (2026-11-03).
- **Depends on**: D15, D24

### D30 — Column updated time on moves
- **Question**: Does moving a column change its updated time?
- **Decision**: Yes, but only for the column that is moved. Columns whose positions shift as a result keep their updated time.
- **Alternatives**: Only renames change it; every shifted column changes too.
- **Why**: User review of the first spec draft (2026-11-03).
- **Depends on**: D5, D15

### D31 — Display ID is not identity
- **Question**: Is a card's display ID (e.g. `CRD-4`) its identity?
- **Decision**: No. Only the UUID identifies a card. After a card is deleted, a different card can get the same display ID (e.g. through a new board reusing the key) and is a different card.
- **Alternatives**: —
- **Why**: User review of the first spec draft (2026-11-03).
- **Depends on**: D3, D6, D12

### D32 — Changes to deleted cards
- **Question**: What happens when a change targets a card that another device already deleted?
- **Decision**: The change fails with a not-found error. The card is not recreated and nothing else changes.
- **Alternatives**: Recreate the card (upsert).
- **Why**: User review of the first spec draft (2026-11-03).
- **Depends on**: D7, D19

### D33 — Email format
- **Question**: Which format must an email follow?
- **Decision**: The `addr-spec` syntax of RFC 5322, section 3.4.1. ASCII only, no comments or folding whitespace.
- **Alternatives**: RFC 5322 plus RFC 6531 (internationalized addresses).
- **Why**: Consistent support across mail libraries on all platforms.
- **Depends on**: D16, D17

### D34 — No platform names in domain specs
- **Question**: May domain specs name concrete platforms?
- **Decision**: No. Domain specs describe rules without naming Android, iOS or web; those are implementation details.
- **Alternatives**: —
- **Why**: User review of the first spec draft (2026-11-03).
- **Depends on**: D1

## Facts

- Boards and labels are private per user; no sharing or members in v1. — source: `docs/breakdown/OVERVIEW.md`
- Labels are per user and shared across all of the user's boards. — source: `docs/design/DECISIONS.md`
- Board key: 2–5 uppercase letters, unique per user, not editable after creation. — source: `docs/design/DECISIONS.md`
- Card display ID is board key + card number, e.g. `CRD-109`. — source: `docs/design/DECISIONS.md`
- Card fields: title, plain-text description (no Markdown), labels, read-only created and updated time. — source: `docs/design/DECISIONS.md`
- Deleting a column deletes its cards. — source: `docs/design/DECISIONS.md`
- Deleting a label removes it from cards. — source: `docs/breakdown/chunks/25-be-labels.md`
- Password rule: at least 12 characters with a lowercase letter, an uppercase letter and a digit. — source: `docs/design/DECISIONS.md`
- Label colors come from a fixed palette of 20 named colors. — source: `docs/design/foundations.html`
- Text normalization, counting and invalid-character rules already exist. — source: `openspec/specs/text-length/spec.md`

## Out of scope

- Glossary of terms.
- Operations and flows (create, rename, move, import, export, search) and their API shapes.
- Default columns on board creation (boards feature spec).
- Tokens, sessions, login and registration flows (auth feature spec).
- Account deletion and user profile data.
- Board sharing, members, comments, attachments.
- Display formatting of timestamps.

## Deferred

- How import keeps card numbers and the next card number consistent with D6 — settle before: specs of the import/export feature.
- Error shapes for validation, not found and conflict cases — settle before: specs of the API contract.
