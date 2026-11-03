# domain-card Specification

## Purpose

Defines what a card is, which board and column it belongs to, the rules for its fields, number, display ID and labels, and how its timestamps behave.

## Requirements

### Requirement: Cards have a backend-assigned identifier
Every card SHALL have an opaque UUID assigned by the backend when the card is created. The identifier SHALL never change.

#### Scenario: New card gets an identifier
- **WHEN** a card is created
- **THEN** the backend assigns it a UUID that stays the same for the card's whole life

### Requirement: A card stays in one board
Every card SHALL be in exactly one column at any time. A card SHALL only ever be in columns of the board it was created in. Moving a card to a column of another board SHALL be rejected.

#### Scenario: Move within the board
- **WHEN** a card is moved to another column of the same board
- **THEN** the card is in the new column and keeps its number and display ID

#### Scenario: Move to another board
- **WHEN** a card is moved to a column of a different board
- **THEN** the move is rejected and the card stays where it was

### Requirement: Card title
Every card SHALL have a required, single-line title with a length of 1 to 200, normalized and counted as defined in `text-length`.

#### Scenario: Empty title
- **WHEN** a card is saved with a title containing only spaces
- **THEN** it is rejected with a validation error for the title

#### Scenario: Title too long
- **WHEN** a card title has a normalized length of 201
- **THEN** it is rejected with a validation error for the title

### Requirement: Card description
Every card SHALL have a plain-text, multi-line description with a length of 0 to 10,000, normalized and counted as defined in `text-length`. A card without a description SHALL have the empty string as its description. The description SHALL be treated as plain text, never as markup.

#### Scenario: No description
- **WHEN** a card is saved with a description containing only whitespace
- **THEN** its description is the empty string

#### Scenario: Markup is kept as text
- **WHEN** a card description is `**bold**`
- **THEN** the description is the literal text `**bold**`

#### Scenario: Description too long
- **WHEN** a card description has a normalized length of 10,001
- **THEN** it is rejected with a validation error for the description

### Requirement: Card number is unique per board and never reused
Every card SHALL have a positive integer number assigned by the backend when the card is created. The first card created in a board SHALL get 1. Each new card in that board SHALL get a number higher than every number ever assigned in that board. Numbers of deleted cards SHALL never be assigned again. A card's number SHALL never change.

#### Scenario: Numbers increase
- **WHEN** cards 1, 2 and 3 exist in a board and a new card is created there
- **THEN** the new card gets number 4

#### Scenario: Deleted number is not reused
- **WHEN** card 4 is the newest card in a board, it is deleted, and a new card is created
- **THEN** the new card gets number 5

#### Scenario: Numbers are counted per board
- **WHEN** a user has two boards and creates the first card in the second board
- **THEN** that card gets number 1, regardless of the cards in the first board

### Requirement: Card display ID
A card's display ID SHALL be its board's key, a hyphen, and the card number in decimal without leading zeros. It SHALL be unique among the cards that currently exist for a user and SHALL never change while the card exists.

#### Scenario: Display ID format
- **WHEN** card number 109 is in the board with the key `CRD`
- **THEN** its display ID is `CRD-109`

### Requirement: Display ID is not a card's identity
A card SHALL be identified only by its UUID. The display ID SHALL be a human-readable label and SHALL NOT be used to identify a card. After a card is deleted, a different card SHALL be allowed to get the same display ID, and it SHALL be a different card with a different UUID.

#### Scenario: Display ID used again in another board
- **WHEN** a user deletes card `CRD-4` and its board, later creates a new board with the key `CRD`, and creates four cards in it
- **THEN** the fourth card has the display ID `CRD-4`, has a different UUID than the deleted card, and is unrelated to it

#### Scenario: Two cards with the same display ID over time
- **WHEN** two cards had the display ID `CRD-4` at different times
- **THEN** they are different cards, because their UUIDs differ

### Requirement: Card labels are a set sorted by name
A card SHALL have zero or more labels, each attached at most once, and each owned by the card's owner. Labels on a card SHALL have no manual order. They SHALL be presented sorted by their case-folded name, as defined in `domain-label`.

#### Scenario: No duplicate labels
- **WHEN** any change is made to a card's labels
- **THEN** the card never holds the same label more than once

#### Scenario: Sorted by name
- **WHEN** the labels `frontend`, `Bug` and `api` are attached to a card in this order
- **THEN** they are presented as `api`, `Bug`, `frontend`

### Requirement: Card timestamps
Every card SHALL have a created time and an updated time, both set by the backend in UTC. The created time SHALL never change. The updated time SHALL change when the card's title, description or set of labels changes, when a label it carries is deleted, and when the card is moved to another column. Renaming or recoloring a label SHALL NOT change the updated time of cards that carry it.

#### Scenario: Label attached
- **WHEN** a label is attached to a card
- **THEN** the card's updated time changes to the time of that change

#### Scenario: Carried label deleted
- **WHEN** a label carried by a card is deleted
- **THEN** the card's updated time changes to the time of the deletion

#### Scenario: Card moved to another column
- **WHEN** a card is moved to another column of its board
- **THEN** the card's updated time changes to the time of the move

#### Scenario: Label renamed
- **WHEN** a label carried by a card is renamed
- **THEN** the card's updated time does not change
