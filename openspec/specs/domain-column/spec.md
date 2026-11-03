# domain-column Specification

## Purpose

Defines what a column is, which board it belongs to, the rules for its name and timestamps, and what is removed when a column is deleted.

## Requirements

### Requirement: Columns have a backend-assigned identifier
Every column SHALL have an opaque UUID assigned by the backend when the column is created. The identifier SHALL never change.

#### Scenario: New column gets an identifier
- **WHEN** a column is created
- **THEN** the backend assigns it a UUID that stays the same for the column's whole life

### Requirement: A column belongs to exactly one board
Every column SHALL belong to exactly one board for its whole life. A board SHALL be allowed to have zero or more columns.

#### Scenario: Last column is deleted
- **WHEN** the only column of a board is deleted
- **THEN** the board still exists and has zero columns

### Requirement: Column name
Every column SHALL have a required, single-line name with a length of 1 to 30, normalized and counted as defined in `text-length`. Column names SHALL NOT need to be unique within a board.

#### Scenario: Duplicate column names
- **WHEN** a board already has a column named `Review` and another column in it is saved as `Review`
- **THEN** both columns exist

#### Scenario: Name too long
- **WHEN** a column name has a normalized length of 31
- **THEN** it is rejected with a validation error for the name

### Requirement: Column timestamps
Every column SHALL have a created time and an updated time, both set by the backend in UTC. The created time SHALL never change. The updated time SHALL change when the column's name changes and when the column is moved to a new position. Columns whose positions only shift because another column moved SHALL keep their updated time.

#### Scenario: Column is renamed
- **WHEN** a column is renamed
- **THEN** its updated time changes to the time of the rename

#### Scenario: Column is moved
- **WHEN** a board has columns A, B, C at positions 0, 1, 2 and C is moved to position 0
- **THEN** C's updated time changes to the time of the move, and the updated times of A and B do not change

### Requirement: Deleting a column removes its cards
Deleting a column SHALL permanently delete the column and all its cards. Deleted data SHALL NOT be restorable. The positions of the remaining columns SHALL stay dense as defined in `domain-ordering`.

#### Scenario: Column with cards is deleted
- **WHEN** a column with three cards is deleted
- **THEN** the column and its three cards no longer exist, and the other columns of the board are unchanged except for their positions
