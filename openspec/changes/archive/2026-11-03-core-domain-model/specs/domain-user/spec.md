# Spec Delta

## Purpose

Defines who a Cardigan user is, which email and password rules always apply to them, and how all boards and labels are owned by and isolated to one user.

## ADDED Requirements

### Requirement: Users have a backend-assigned identifier
Every user SHALL have an opaque UUID assigned by the backend when the user is created. The identifier SHALL never change.

#### Scenario: New user gets an identifier
- **WHEN** a user account is created
- **THEN** the backend assigns it a UUID that stays the same for the account's whole life

### Requirement: Email identifies exactly one user
Each user SHALL have exactly one email of 1 to 254 characters, single-line, normalized and counted as defined in `text-length`. No two users SHALL have emails that are equal after Unicode default case folding. The email SHALL be stored as entered after normalization, not case-folded.

#### Scenario: Same email in different case
- **WHEN** a user with the email `Ann@example.com` exists and another account is created with `ann@EXAMPLE.com`
- **THEN** the second account is rejected because the email is already used

#### Scenario: Email is kept as entered
- **WHEN** a user registers with `  Ann@Example.com `
- **THEN** the stored email is `Ann@Example.com`

#### Scenario: Email over the limit
- **WHEN** an email has a normalized length of 255
- **THEN** it is rejected with a validation error for the email

### Requirement: Email follows the RFC 5322 address format
After normalization, an email SHALL match the `addr-spec` syntax of RFC 5322, section 3.4.1, using ASCII characters only and without comments or folding whitespace. Any other email SHALL be rejected with a validation error for the email.

#### Scenario: Valid address
- **WHEN** an email is `ann.lee+cards@example.com`
- **THEN** it is accepted

#### Scenario: Missing domain
- **WHEN** an email is `ann@`
- **THEN** it is rejected with a validation error for the email

#### Scenario: Non-ASCII address
- **WHEN** an email is `jürgen@münchen.de`
- **THEN** it is rejected with a validation error for the email

#### Scenario: Comment in the address
- **WHEN** an email is `ann(work)@example.com`
- **THEN** it is rejected with a validation error for the email

### Requirement: Passwords follow one composition rule
A password SHALL have a length of 12 to 128, normalized and counted as defined in `text-length`. It SHALL contain at least one character of Unicode category Ll (lowercase letter), one of category Lu (uppercase letter) and one of category Nd (decimal digit).

#### Scenario: Valid password
- **WHEN** a password is `Correct horse 7`
- **THEN** it is accepted

#### Scenario: Missing a character class
- **WHEN** a password of length 14 contains lowercase and uppercase letters but no decimal digit
- **THEN** it is rejected with a validation error for the password

#### Scenario: Non-ASCII letters count
- **WHEN** a password is `äöüÄÖÜ١٢٣ßßßß` (lowercase and uppercase umlauts and Arabic-Indic digits)
- **THEN** it meets the character class rule

#### Scenario: Too long
- **WHEN** a password has a length of 129
- **THEN** it is rejected with a validation error for the password

### Requirement: Boards and labels belong to exactly one user
Every board and every label SHALL be owned by exactly one user, and the owner SHALL never change. Columns and cards SHALL belong to the owner of their board. A user SHALL only be able to read or change data they own.

#### Scenario: Board owner is fixed
- **WHEN** a user creates a board
- **THEN** that user is its owner for the board's whole life

#### Scenario: Card owner follows its board
- **WHEN** a card is in a board owned by user A
- **THEN** the card belongs to user A

### Requirement: Other users' data is treated as not found
Any reference by a user to a board, column, card or label owned by another user SHALL behave exactly like a reference to an identifier that does not exist. The response SHALL NOT reveal whether the data exists.

#### Scenario: Guessed board identifier
- **WHEN** user B requests a board by the UUID of a board owned by user A
- **THEN** the result is the same not-found outcome as for a UUID that does not exist

#### Scenario: Another user's label on a card
- **WHEN** user B tries to attach a label owned by user A to one of user B's cards
- **THEN** the label is treated as not found and the card is not changed
