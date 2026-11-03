# text-length Specification

## Purpose

Defines one shared way to normalize, validate and count user-entered text, so backend, Android, iOS and web always agree on a text's length and whether it is valid.

## Requirements

### Requirement: Text is normalized before validation
Every text field except passwords SHALL be normalized in this order before it is validated, counted or stored: convert each CRLF and each lone CR to LF, normalize to Unicode NFC, then remove leading and trailing characters that have the Unicode White_Space property.

#### Scenario: Surrounding whitespace is removed
- **WHEN** a card title `"  Release "` is submitted
- **THEN** it is treated as `"Release"`

#### Scenario: Whitespace-only text is empty
- **WHEN** a field contains only whitespace such as `" 　\n"`
- **THEN** it is treated as an empty string of length 0

#### Scenario: Line breaks become LF
- **WHEN** a multi-line card description `"a\r\nb\rc"` is submitted
- **THEN** it is treated as `"a\nb\nc"`

#### Scenario: Decomposed text is composed
- **WHEN** a field contains `"é"` (e followed by a combining acute accent)
- **THEN** it is treated as `"é"`

### Requirement: Passwords are normalized without trimming
Passwords SHALL be normalized to Unicode NFC before they are validated, counted, hashed or compared. Leading and trailing whitespace in passwords SHALL be kept.

#### Scenario: Password whitespace is kept
- **WHEN** a user registers with the password `" Secret Pass 1 "`
- **THEN** the leading and trailing spaces are part of the password and count toward its length

#### Scenario: Same visible password matches
- **WHEN** a user registered with a password containing `"é"` logs in with the same password typed as `"é"`
- **THEN** the passwords match

### Requirement: Length is counted in Unicode code points
The length of a text SHALL be the number of Unicode code points in its normalized form. Every minimum and maximum length in any Cardigan spec SHALL be measured this way.

#### Scenario: Emoji counts as one
- **WHEN** the normalized text is `"👍"`
- **THEN** its length is 1

#### Scenario: Joined emoji counts each code point
- **WHEN** the normalized text is `"👨‍👩‍👧"` (three emojis joined by two zero-width joiners)
- **THEN** its length is 5

#### Scenario: Non-Latin script counts per code point
- **WHEN** the normalized text is `"看板"`
- **THEN** its length is 2

#### Scenario: Line break counts as one
- **WHEN** the normalized text is `"a\nb"`
- **THEN** its length is 3

### Requirement: Invalid characters are rejected
Text containing an unpaired surrogate or a control character in U+0000–U+001F SHALL be rejected with a validation error naming the field. Tab, LF and CR SHALL be allowed only in fields that allow multi-line text. Passwords SHALL NOT contain any control character.

#### Scenario: Control character in a single-line field
- **WHEN** a board name contains a tab or a line break
- **THEN** the request is rejected with a validation error for that field

#### Scenario: Line break in a multi-line field
- **WHEN** a card description contains line breaks
- **THEN** the line breaks are accepted

#### Scenario: NUL character
- **WHEN** any field, including a multi-line field, contains U+0000
- **THEN** the request is rejected with a validation error for that field

#### Scenario: Unpaired surrogate
- **WHEN** a field contains an unpaired surrogate such as `"\uD83D"` on its own
- **THEN** the request is rejected with a validation error for that field

#### Scenario: Control character in a password
- **WHEN** a password contains a tab
- **THEN** the request is rejected with a validation error for the password

### Requirement: Backend rejects text outside its length limits
The backend SHALL reject a request with a validation error naming the field when the normalized length of any text field is below its minimum or above its maximum. It SHALL NOT truncate text and SHALL NOT store any part of a rejected request.

#### Scenario: Over-limit text
- **WHEN** a field with a maximum of 50 receives text whose normalized length is 51
- **THEN** the request is rejected with a validation error for that field and nothing is stored

#### Scenario: Limit reached by trimming
- **WHEN** a field with a maximum of 50 receives 50 characters surrounded by spaces
- **THEN** the text is accepted, because its normalized length is 50

#### Scenario: Empty required field
- **WHEN** a required field receives only whitespace
- **THEN** the request is rejected with a validation error for that field

### Requirement: Backend stores and returns normalized text
The backend SHALL store the normalized form of every accepted text field and SHALL return that stored form in all responses. Clients SHALL display the value returned by the backend.

#### Scenario: Response contains normalized text
- **WHEN** a client saves the board name `"  Roadmap  "`
- **THEN** the response contains `"Roadmap"`, and the client shows `"Roadmap"`

### Requirement: Clients validate with the same rule
Web, Android and iOS clients SHALL apply the same normalization, character and length rules before sending text, and SHALL NOT send text that breaks them. The backend's validation SHALL remain authoritative.

#### Scenario: Client and backend agree
- **WHEN** a client accepts a text as valid for a field
- **THEN** the backend accepts the same text for that field

#### Scenario: Client blocks over-limit text
- **WHEN** a user enters text whose normalized length is above the field's maximum
- **THEN** the client does not send the request
