# Spec Delta

## Purpose

Defines the versioned JSON file a complete board is exported to, and the rules every platform follows when such a file is downloaded, uploaded, validated and turned back into a board.

## ADDED Requirements

### Requirement: Export file identifies its format and version
An export file SHALL be a JSON object with `format` set to `cardigan.board`, `formatVersion` set to the integer `1`, `exportedAt` as a timestamp in the API timestamp format, and `board`. Field names SHALL be camelCase.

#### Scenario: Export header
- **WHEN** a board is exported on 4 November 2026
- **THEN** the parsed file has `format` `cardigan.board`, `formatVersion` `1` and `exportedAt` equal to the time of the export

### Requirement: Export file contains the complete board
`board` SHALL contain `name`, `key`, `labels` and `columns`. `labels` SHALL list, with `name` and `color`, every label carried by at least one card of the board, sorted by name in the label list order. `columns` SHALL list every column in position order, each with `name` and `cards`. `cards` SHALL list the column's cards in position order.

#### Scenario: Unused label
- **WHEN** a user has the labels `Bug` and `Docs` and only `Bug` is on a card of the exported board
- **THEN** the file's `labels` contains `Bug` and not `Docs`

#### Scenario: Empty column
- **WHEN** a column has no cards
- **THEN** it appears in `columns` with an empty `cards` array

### Requirement: Exported cards
Each card in the file SHALL contain `number`, `title`, `description`, `labels`, `createdAt` and `updatedAt`. `labels` SHALL be the names of the card's labels, sorted as defined in `domain-card`. Text SHALL be the stored normalized form.

#### Scenario: Card in the file
- **WHEN** card `CRD-109` with the title `Fix login` and the label `Bug` is exported
- **THEN** its entry has `"number": 109`, `"title": "Fix login"` and `"labels": ["Bug"]`

### Requirement: Export file has no identifiers or positions
The file SHALL NOT contain UUIDs of any entity or position numbers. Order SHALL be given only by array order.

#### Scenario: Exact fields
- **WHEN** a board is exported
- **THEN** the file root has exactly `format`, `formatVersion`, `exportedAt`, `board`; the board has exactly `name`, `key`, `labels`, `columns`; a label has exactly `name`, `color`; a column has exactly `name`, `cards`; and a card has exactly `number`, `title`, `description`, `labels`, `createdAt`, `updatedAt`

### Requirement: Export download
Export SHALL return 200 with the complete file in the response to one request, with the content type `application/json` and a `Content-Disposition` attachment file name of `<KEY>-<yyyy-MM-dd>.json`, using the board key and the UTC date part of `exportedAt`. The file SHALL be a consistent snapshot of the board at one point in time. Export SHALL have no size limit and SHALL always return the complete board. A file over 5 MB cannot be imported again; this is an accepted limit of v1.

#### Scenario: Board over the import limit
- **WHEN** a board whose export file is larger than 5 MB is exported
- **THEN** the response is 200 with the complete file

#### Scenario: Download name
- **WHEN** the board with the key `CRD` is exported on 4 November 2026 UTC
- **THEN** the suggested file name is `CRD-2026-11-04.json`

### Requirement: Import upload
Import SHALL be one blocking `multipart/form-data` request with a required `file` part holding the export file and an optional `key` part. Other parts SHALL be ignored and SHALL NOT be stored. The backend SHALL ignore the content type and file name of the `file` part and judge only its content. A missing `file` part SHALL produce 400 `VALIDATION_FAILED` with a field error for `file` with code `REQUIRED`. A successful import SHALL return 201 with the created board.

#### Scenario: Missing file
- **WHEN** a multipart request has no `file` part
- **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `file` with code `REQUIRED`

#### Scenario: Not multipart
- **WHEN** the import endpoint receives `application/json`
- **THEN** the response is 415 `UNSUPPORTED_MEDIA_TYPE`

#### Scenario: Successful import
- **WHEN** a valid file is uploaded
- **THEN** the response is 201 with the new board owned by the current user

### Requirement: Import size limits
A `file` part over 5,242,880 bytes (5 MB) SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`; multipart overhead does not count. The whole multipart request SHALL NOT exceed 5,242,880 bytes plus 64 KB for the `key` part and multipart overhead; a larger request SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`. Everything in front of the backend SHALL accept requests of at least the import limit, so that the backend produces the 413.

#### Scenario: File too large
- **WHEN** a client uploads a 6 MB file
- **THEN** the response is 413 `PAYLOAD_TOO_LARGE` and nothing is stored

#### Scenario: Exactly at the limit
- **WHEN** a client uploads a valid file of exactly 5,242,880 bytes
- **THEN** the file is not rejected for its size

#### Scenario: One byte over
- **WHEN** a client uploads a file of 5,242,881 bytes
- **THEN** the response is 413 `PAYLOAD_TOO_LARGE`

### Requirement: Import item limits
A file SHALL contain at most 200 columns, 20,000 cards and 500 labels in `board.labels`. A file over one of these limits SHALL be rejected as an invalid file.

#### Scenario: Too many labels
- **WHEN** a file has 501 entries in `board.labels`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

### Requirement: Import is all or nothing
An import SHALL either create the board with all its columns, cards and new labels, or store nothing at all.

#### Scenario: One invalid card
- **WHEN** a file declares the new label `Docs`, has 50 valid cards and one card with an empty title
- **THEN** the response is 422 `INVALID_EXPORT_FILE`, and the user's boards and labels are unchanged

#### Scenario: Failure while storing
- **WHEN** storing fails after part of a valid file was written
- **THEN** the response is 500 `INTERNAL_ERROR`, and the user's boards and labels are unchanged

### Requirement: Unreadable or unsupported files
A file that is not valid JSON, whose `format` is not `cardigan.board`, or whose `formatVersion` is not a supported version SHALL be rejected with 422 `INVALID_EXPORT_FILE`. Unknown fields in a supported file SHALL be ignored.

#### Scenario: Not JSON
- **WHEN** a client uploads a PNG image
- **THEN** the response is 422 `INVALID_EXPORT_FILE`

#### Scenario: Future version
- **WHEN** a file has `"formatVersion": 2` and the backend supports only version 1
- **THEN** the response is 422 `INVALID_EXPORT_FILE`

#### Scenario: Extra field
- **WHEN** a version 1 file contains an unknown field on a card
- **THEN** the field is ignored and the import proceeds

### Requirement: Import validates every rule of the domain
Every value in the file, except `exportedAt`, `createdAt` and `updatedAt`, SHALL be normalized and validated with the same rules that apply when the data is created through the API. Any violation SHALL reject the file with 422 `INVALID_EXPORT_FILE` and an empty `fieldErrors`, and the response SHALL NOT say what failed. The backend SHALL stop validating at the first violation and SHALL log its JSON path and rule.

#### Scenario: Title too long in the file
- **WHEN** the first card of the second column has a title with a normalized length of 201
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Unknown color
- **WHEN** a file label has the color `Magenta`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

### Requirement: Missing and wrong-typed values in the file
A missing required field or a value of the wrong JSON type SHALL make the file invalid, and SHALL NOT produce `MALFORMED_REQUEST`. `format`, `formatVersion`, `board`, `name`, `key`, `labels`, `columns`, `cards`, `number`, `title` and `color` are required. A missing `description` SHALL mean the empty string. `exportedAt`, `createdAt` and `updatedAt` SHALL NOT be validated and may be missing.

#### Scenario: Missing required field
- **WHEN** a card in the file has no `title`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Wrong-typed field
- **WHEN** a card in the file has a `description` of `123`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Missing description
- **WHEN** a card in the file has no `description`
- **THEN** the import proceeds and the card's description is the empty string

#### Scenario: Broken timestamp
- **WHEN** a card has `"createdAt": "yesterday"`
- **THEN** the import proceeds

### Requirement: Card numbers in the file
Card numbers in the file SHALL be integers from 1 to 1,000,000,000, unique within the file. Any other integer SHALL make the file invalid. Imported cards SHALL keep their numbers. New cards created later in the imported board SHALL get numbers higher than the highest number in the file.

#### Scenario: Numbers are kept
- **WHEN** a file contains cards 3, 7 and 109 for the key `CRD`
- **THEN** the imported cards have the display IDs `CRD-3`, `CRD-7` and `CRD-109`, and the next new card gets number 110

#### Scenario: Duplicate number
- **WHEN** two cards in the file have the number 7
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Number too large
- **WHEN** a card in the file has the number 9007199254740993
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Number zero
- **WHEN** a card in the file has the number 0
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

### Requirement: Card labels must be declared in the file
Every name in a card's `labels` SHALL match, by case-folded name, a label in the file's `board.labels`. Two entries in `board.labels` SHALL NOT have the same case-folded name. Card label names that map to the same label SHALL count as one label.

#### Scenario: Undeclared label
- **WHEN** a card lists the label `Urgent` and `board.labels` has no `Urgent`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Duplicate declared label
- **WHEN** `board.labels` has `Bug` and `bug`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Duplicate label on a card
- **WHEN** a card lists `Bug` and `bug`
- **THEN** the import proceeds and the card carries that label once

### Requirement: Labels are reused by name on import
A file label whose case-folded name equals the name of one of the current user's labels SHALL map to that existing label, which keeps its current name and color. Every other file label SHALL be created for the user with the name and color from the file.

#### Scenario: Existing label reused
- **WHEN** the user has the label `bug` colored `Blue` and the file has `Bug` colored `Red`
- **THEN** imported cards carry the existing `bug` label, which stays `Blue`, and no new label is created

#### Scenario: New label created
- **WHEN** the file has the label `Docs` colored `Teal` and the user has no label with that name
- **THEN** a new label `Docs` with the color `Teal` is created for the user

### Requirement: Imported board key and clashes
The imported board SHALL use the `key` part of the request when it is present, otherwise the file's key. An invalid `key` part SHALL produce 400 `VALIDATION_FAILED` with a field error for `key`. When the `key` part is present, `board.key` in the file SHALL be ignored. When that key is already used by one of the user's boards, the import SHALL fail with 409 `CONFLICT` with a field error for `key` with code `ALREADY_USED`, and nothing SHALL be stored.

#### Scenario: Key clash
- **WHEN** the user has a board with the key `CRD` and imports a file with the key `CRD` without a `key` part
- **THEN** the response is 409 `CONFLICT` with the field error `{ "field": "key", "code": "ALREADY_USED" }`

#### Scenario: Retry with another key
- **WHEN** the user then imports the same file with the `key` part `CRDB`
- **THEN** the board is created with the key `CRDB` and its cards have display IDs like `CRDB-109`

#### Scenario: Invalid key part
- **WHEN** a valid file is uploaded with the `key` part `C1`
- **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `key` with code `INVALID_FORMAT`

### Requirement: Imported board structure
The imported board SHALL have exactly the columns of the file, in file order, even when the file has no columns. No default columns SHALL be added. Each column SHALL have exactly the cards of the file, in file order.

#### Scenario: File without columns
- **WHEN** a file has an empty `columns` array
- **THEN** the imported board has zero columns

### Requirement: Imported data gets new identity and times
Every imported board, column, card and created label SHALL get a new backend-assigned UUID. All their created and updated times SHALL be set to the time of the import, as one identical value for an import. Timestamps in the file SHALL be ignored.

#### Scenario: Old timestamps
- **WHEN** a file contains a card with `createdAt` in 2025
- **THEN** the imported card's created time is the time of the import

#### Scenario: Import into another account
- **WHEN** user A's export is imported by user B, who has no boards or labels
- **THEN** exporting user B's board gives a file equal to user A's, except for `exportedAt`, `createdAt` and `updatedAt`
