# domain-ordering Specification

## Purpose

Defines how the order of columns in a board and cards in a column is represented, and how concurrent changes resolve without ever breaking that order.

## Requirements

### Requirement: Columns have dense positions in their board
Every column SHALL have an integer position within its board. For a board with n columns, the positions SHALL be exactly 0 to n-1, each used once. Columns SHALL be ordered by ascending position.

#### Scenario: Positions after a column is deleted
- **WHEN** a board has columns at positions 0, 1 and 2 and the column at position 1 is deleted
- **THEN** the remaining columns have positions 0 and 1 in their previous relative order

#### Scenario: Positions after a column is moved
- **WHEN** a board has columns A, B, C at positions 0, 1, 2 and C is moved to position 0
- **THEN** the columns are C, A, B at positions 0, 1, 2

### Requirement: Cards have dense positions in their column
Every card SHALL have an integer position within its column. For a column with n cards, the positions SHALL be exactly 0 to n-1, each used once. Cards SHALL be ordered by ascending position.

#### Scenario: Card moved to another column
- **WHEN** column X has cards at positions 0, 1, 2, column Y has cards at positions 0, 1, and the card at position 1 in X is moved to position 1 in Y
- **THEN** X has cards at positions 0 and 1, and Y has cards at positions 0, 1 and 2 with the moved card at position 1

#### Scenario: Card deleted
- **WHEN** a column has cards at positions 0, 1 and 2 and the card at position 0 is deleted
- **THEN** the remaining cards have positions 0 and 1 in their previous relative order

### Requirement: Order is defined only by positions
The order of columns and cards SHALL be defined only by their positions. Every column and card SHALL carry its position, and columns and cards SHALL always be presented in ascending position order.

#### Scenario: Board is loaded
- **WHEN** a board is loaded
- **THEN** its columns and each column's cards appear in ascending position order

### Requirement: Concurrent changes resolve as last write wins
When two changes to the same data arrive one after the other, the later one SHALL be applied on top of the earlier one, with no version check. After every change, all positions SHALL still be dense as defined in this spec.

#### Scenario: Two devices rename the same card
- **WHEN** device A sets a card title to `A` and device B then sets it to `B` without having seen A's change
- **THEN** the card title is `B`

#### Scenario: Two devices move cards at once
- **WHEN** two devices move cards in the same column at the same time
- **THEN** after both moves the column's card positions are exactly 0 to n-1, each used once

### Requirement: Changes to a deleted card are not found
A change to a card that no longer exists SHALL fail with a not-found error. It SHALL NOT recreate the card or change any other data.

#### Scenario: Edit after delete on another device
- **WHEN** device A deletes a card and device B then saves a new title for that card
- **THEN** device B's change fails with a not-found error and the card is not recreated

#### Scenario: Move after delete on another device
- **WHEN** device A deletes a card and device B then moves that card to another column
- **THEN** the move fails with a not-found error, and no card or position in the board changes
