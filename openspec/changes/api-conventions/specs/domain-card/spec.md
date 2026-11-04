# Spec Delta

## MODIFIED Requirements

### Requirement: Card number is unique per board and never reused
Every card SHALL have a positive integer number. A card created through the API SHALL get its number from the backend: the first card created in a board SHALL get 1, and each new card SHALL get a number higher than every number ever assigned in that board. A card created by an import SHALL keep its number from the file, as defined in `board-export-format`, and those numbers count as assigned. Numbers of deleted cards SHALL never be assigned again. A card's number SHALL never change.

#### Scenario: Numbers increase
- **WHEN** cards 1, 2 and 3 exist in a board and a new card is created there
- **THEN** the new card gets number 4

#### Scenario: Deleted number is not reused
- **WHEN** card 4 is the newest card in a board, it is deleted, and a new card is created
- **THEN** the new card gets number 5

#### Scenario: Numbers are counted per board
- **WHEN** a user has two boards and creates the first card in the second board
- **THEN** that card gets number 1, regardless of the cards in the first board

#### Scenario: Imported card keeps its number
- **WHEN** a card with the number 109 is imported into a new board
- **THEN** it has the number 109 and the next new card in that board gets a higher number

### Requirement: Card labels are a set sorted by name
A card SHALL have zero or more labels, each attached at most once, and each owned by the card's owner. Labels on a card SHALL have no manual order. They SHALL be presented sorted by the Unicode code points of their case-folded name, as defined in `domain-label`, compared in ascending order, independent of locale.

#### Scenario: No duplicate labels
- **WHEN** any change is made to a card's labels
- **THEN** the card never holds the same label more than once

#### Scenario: Sorted by name
- **WHEN** the labels `frontend`, `Bug` and `api` are attached to a card in this order
- **THEN** they are presented as `api`, `Bug`, `frontend`
