# domain-board Specification

## Purpose

Defines what a board is, the rules for its name and key, how its timestamps behave, and what is removed when a board is deleted.

## Requirements

### Requirement: Boards have a backend-assigned identifier
Every board SHALL have an opaque UUID assigned by the backend when the board is created. The identifier SHALL never change.

#### Scenario: New board gets an identifier
- **WHEN** a board is created
- **THEN** the backend assigns it a UUID that stays the same for the board's whole life

### Requirement: Board name
Every board SHALL have a required, single-line name with a length of 1 to 100, normalized and counted as defined in `text-length`. Board names SHALL NOT need to be unique.

#### Scenario: Duplicate board names
- **WHEN** a user already has a board named `Roadmap` and saves another board named `Roadmap`
- **THEN** both boards exist

#### Scenario: Name too long
- **WHEN** a board name has a normalized length of 101
- **THEN** it is rejected with a validation error for the name

### Requirement: Board key format
Every board SHALL have a key of 2 to 5 letters from `A` to `Z`. Lowercase ASCII letters `a` to `z` in a submitted key SHALL be converted to uppercase before validation. Any other character SHALL cause a validation error for the key.

#### Scenario: Lowercase key
- **WHEN** a board is saved with the key `crd`
- **THEN** the key is stored as `CRD`

#### Scenario: Key with a digit
- **WHEN** a board is saved with the key `CR1`
- **THEN** it is rejected with a validation error for the key

#### Scenario: Non-ASCII letter
- **WHEN** a board is saved with the key `ÄB`
- **THEN** it is rejected with a validation error for the key

#### Scenario: Key too short
- **WHEN** a board is saved with the key `C`
- **THEN** it is rejected with a validation error for the key

### Requirement: Board key is unique among a user's existing boards
No two existing boards of the same user SHALL have the same key. Boards of different users SHALL be allowed to share a key. Once a board is deleted, its key SHALL be available again to its former owner.

#### Scenario: Key already used
- **WHEN** a user has a board with the key `CRD` and another board is saved for that user with `CRD`
- **THEN** it is rejected because the key is already used

#### Scenario: Same key for another user
- **WHEN** user A has a board with the key `CRD` and user B saves a board with `CRD`
- **THEN** user B's board is accepted

#### Scenario: Key reused after delete
- **WHEN** a user deletes their board with the key `CRD` and then saves a new board with `CRD`
- **THEN** the new board is accepted

### Requirement: Board key never changes
A board's key SHALL be set when the board is created and SHALL never change afterwards.

#### Scenario: Board is changed
- **WHEN** any change is made to an existing board with the key `CRD`
- **THEN** its key is still `CRD` afterwards

### Requirement: Board timestamps
Every board SHALL have a created time and an updated time, both set by the backend in UTC. The created time SHALL never change. The updated time SHALL change when the board itself changes, and when any of its columns or cards is created, changed, moved or deleted.

#### Scenario: Card edit updates the board
- **WHEN** a card's title is changed
- **THEN** the updated time of the card's board changes to the time of that change

#### Scenario: Card deletion updates the board
- **WHEN** a card is deleted
- **THEN** the updated time of its board changes to the time of the deletion

#### Scenario: Label edit does not update the board
- **WHEN** a label used by cards on a board is renamed or recolored
- **THEN** the board's updated time does not change

### Requirement: Deleting a board removes its content
Deleting a board SHALL permanently delete the board, all its columns and all its cards. It SHALL NOT delete any labels. Deleted data SHALL NOT be restorable.

#### Scenario: Board with content is deleted
- **WHEN** a board with columns, cards and labels attached to cards is deleted
- **THEN** the board, its columns and its cards no longer exist, and the labels still exist
