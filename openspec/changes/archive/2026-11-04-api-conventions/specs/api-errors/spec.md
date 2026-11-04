# Spec Delta

## Purpose

Defines one error model for every Cardigan API response that fails, so all clients can detect, map and show errors the same way without reading backend text.

## ADDED Requirements

### Requirement: Errors use problem details
Every error response produced by the backend SHALL have the content type `application/problem+json` and a body following RFC 9457 with the fields `type`, `title`, `status` and `detail`. It SHALL also contain `code`, one of the top-level error codes, and `fieldErrors`, an array that is empty when no field-level error applies.

#### Scenario: Error body
- **WHEN** a request triggers any code in the top-level catalog, including errors raised before an endpoint is reached
- **THEN** the response body contains `type`, `title`, `status`, `detail`, `code` and `fieldErrors`, and `status` equals the HTTP status code

#### Scenario: No field errors
- **WHEN** a request fails with `NOT_FOUND`
- **THEN** `fieldErrors` is an empty array

### Requirement: Error text is for developers only
`title` and `detail` SHALL be English text meant for developers. They SHALL NOT contain class names, stack traces, SQL, framework messages, tokens, passwords or submitted values, for any error code. `detail` of an `INTERNAL_ERROR` SHALL NOT vary with the failure. Clients SHALL NOT show them to users. Clients SHALL decide what to show based on `code` and the field error codes only.

#### Scenario: Client shows an error
- **WHEN** a client receives an error with code `CONFLICT` and a field error `ALREADY_USED` for `key`
- **THEN** it shows its own localized message for a used key, not the backend's `detail`

#### Scenario: Wrong type in a request
- **WHEN** a request fails with `MALFORMED_REQUEST`
- **THEN** `detail` contains no class names and no submitted values

### Requirement: Top-level error codes
`code` SHALL be one of: `VALIDATION_FAILED` (400), `MALFORMED_REQUEST` (400), `UNAUTHENTICATED` (401), `INVALID_CREDENTIALS` (401), `INVALID_REFRESH_TOKEN` (401), `NOT_FOUND` (404), `ROUTE_NOT_FOUND` (404), `CONFLICT` (409), `PAYLOAD_TOO_LARGE` (413), `UNSUPPORTED_MEDIA_TYPE` (415), `INVALID_EXPORT_FILE` (422), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500). Each code SHALL always be sent with its listed status. `MALFORMED_REQUEST` SHALL have an empty `fieldErrors`.

#### Scenario: Unparseable JSON
- **WHEN** a request body is not valid JSON
- **THEN** the response is 400 `MALFORMED_REQUEST` with empty `fieldErrors`

#### Scenario: Wrong field type
- **WHEN** a move request has `"position": "a"`
- **THEN** the response is 400 `MALFORMED_REQUEST` with empty `fieldErrors`

#### Scenario: Wrong content type
- **WHEN** a JSON endpoint receives a body with the content type `text/plain`
- **THEN** the response is 415 with the code `UNSUPPORTED_MEDIA_TYPE`

#### Scenario: Unexpected failure
- **WHEN** the backend fails for a reason not covered by another code
- **THEN** the response is 500 with the code `INTERNAL_ERROR`, `fieldErrors` is empty, and `title` and `detail` are the same fixed text for every internal error

### Requirement: Login failures look the same
`INVALID_CREDENTIALS` SHALL be used for a wrong login email or password, with an identical response in both cases. The backend SHALL do the same password verification work for an unknown email.

#### Scenario: Unknown email and wrong password
- **WHEN** one login uses an unknown email and another uses a wrong password for a known email
- **THEN** both responses are 401 `INVALID_CREDENTIALS` with identical bodies

### Requirement: Clients handle unknown error codes by status
Adding a top-level or field error code SHALL count as an additive change. A client that receives a code it does not know SHALL handle the error by its HTTP status and SHALL show the same message it shows for other errors with that status. A client SHALL also handle an error response that is not valid problem details, such as from a proxy, by its HTTP status. 5xx responses SHALL be treated as temporary.

#### Scenario: New code
- **WHEN** a client receives a 409 error with a code it does not know
- **THEN** it shows its general message for a 409 and does not fail to parse the response

#### Scenario: New field code
- **WHEN** a client receives 400 `VALIDATION_FAILED` with a field error code it does not know
- **THEN** it shows its general invalid-value message on that field

### Requirement: Field errors identify the field and rule
Each entry in `fieldErrors` SHALL contain `field` and `code`. `field` SHALL be the JSON path of the property in the request body, using dots for nested objects and `[index]` for array items, such as `name` or `labelIds[2]`. Several field errors SHALL be allowed for one request.

#### Scenario: Two broken fields
- **WHEN** a board is created with an empty name and the key `C1`
- **THEN** `fieldErrors` contains exactly `name` with code `REQUIRED` and `key` with code `INVALID_FORMAT`

#### Scenario: Array item
- **WHEN** the third entry of `labelIds` is not a valid UUID
- **THEN** the field error has the field `labelIds[2]` with code `INVALID_FORMAT`

### Requirement: Field error codes
A field error `code` SHALL be one of: `REQUIRED` (missing, null or empty after normalization), `TOO_SHORT`, `TOO_LONG`, `INVALID_CHARACTER` (a character forbidden by `text-length`), `INVALID_FORMAT` (such as email, board key or UUID syntax), `INVALID_VALUE` (not an allowed value, such as an unknown color), `PASSWORD_TOO_WEAK` (a required character class is missing), `ALREADY_USED`, `OUT_OF_RANGE`.

#### Scenario: Unknown color
- **WHEN** a label is saved with the color `#FF0000`
- **THEN** the field error for `color` has the code `INVALID_VALUE`

#### Scenario: Password without digit
- **WHEN** a password of valid length has no decimal digit
- **THEN** the field error for `password` has the code `PASSWORD_TOO_WEAK`

#### Scenario: Tab in a board name
- **WHEN** a board name contains a tab
- **THEN** the field error for `name` has the code `INVALID_CHARACTER`

### Requirement: One field error per field
Each field SHALL produce at most one entry, using the first rule it breaks in this order: `REQUIRED`, `INVALID_CHARACTER`, `TOO_SHORT`, `TOO_LONG`, `INVALID_FORMAT`, `PASSWORD_TOO_WEAK`, `INVALID_VALUE`, `OUT_OF_RANGE`. For a board key, a wrong length SHALL be `TOO_SHORT` or `TOO_LONG` and a wrong character SHALL be `INVALID_FORMAT`.

#### Scenario: Short board key
- **WHEN** a board is saved with the key `C`
- **THEN** the field error for `key` has the code `TOO_SHORT` with `min` 2

### Requirement: Limit errors carry the limit
`TOO_SHORT` SHALL contain `min`, `TOO_LONG` SHALL contain `max`, and `OUT_OF_RANGE` SHALL contain both, as integers. Lengths SHALL be counted as defined in `text-length`.

#### Scenario: Name too long
- **WHEN** a board name has a normalized length of 101
- **THEN** the field error is `{ "field": "name", "code": "TOO_LONG", "max": 100 }`

#### Scenario: Key too short
- **WHEN** a board key has the length 1
- **THEN** the field error is `{ "field": "key", "code": "TOO_SHORT", "min": 2 }`

#### Scenario: Position out of range
- **WHEN** a column in a board with 3 columns is moved to position 5
- **THEN** the field error for `position` has the code `OUT_OF_RANGE` with `min` 0 and `max` 2

### Requirement: Validation errors report all broken fields
When a request breaks one or more field rules, the response SHALL be 400 `VALIDATION_FAILED` and `fieldErrors` SHALL list every broken field. Nothing from the request SHALL be stored.

#### Scenario: Validation failure stores nothing
- **WHEN** a card update contains a valid title and an over-limit description
- **THEN** the response is 400 `VALIDATION_FAILED` and neither the title nor the description changes

### Requirement: Uniqueness clashes are conflicts
When a request would break a uniqueness rule, such as a used email, board key or label name, the response SHALL be 409 `CONFLICT` with a field error for the clashing field with the code `ALREADY_USED`. Nothing from the request SHALL be stored.

#### Scenario: Board key used
- **WHEN** a user creates a board with a key used by another of their boards
- **THEN** the response is 409 `CONFLICT` with the field error `{ "field": "key", "code": "ALREADY_USED" }`

#### Scenario: Email used
- **WHEN** someone registers with an email that already belongs to a user
- **THEN** the response is 409 `CONFLICT` with a field error for `email` with code `ALREADY_USED`

### Requirement: Other users' data is not found, never forbidden
Every reference to a board, column, card or label that does not exist or belongs to another user SHALL produce 404 `NOT_FOUND`, whether the identifier is in the path or the request body. A column or card referenced under a board it does not belong to SHALL also produce 404 `NOT_FOUND`. The API SHALL NOT respond with 403 for data owned by another user.

#### Scenario: Another user's board
- **WHEN** user B requests a board owned by user A
- **THEN** the response is 404 `NOT_FOUND`, identical to the response for a board identifier that never existed

#### Scenario: Foreign label in the body
- **WHEN** user B sends a request that attaches a label owned by user A
- **THEN** the response is 404 `NOT_FOUND` and nothing changes

#### Scenario: Move target column does not exist
- **WHEN** a card move names a target column that does not exist
- **THEN** the response is 404 `NOT_FOUND` and no position changes

#### Scenario: Target column in another board
- **WHEN** a card is moved to a column of another board of the same user
- **THEN** the response is 404 `NOT_FOUND` and no position changes

### Requirement: Error precedence
When a request breaks several rules, the backend SHALL report only the first applying rule in this order: rate limit (429); access token (401 `UNAUTHENTICATED`); size (413); media type (415); parsing (400 `MALFORMED_REQUEST`); route and references (404); field validation (400 `VALIDATION_FAILED`, or 422 `INVALID_EXPORT_FILE` for import file content); credentials and refresh tokens (401 `INVALID_CREDENTIALS`, 401 `INVALID_REFRESH_TOKEN`); uniqueness (409).

#### Scenario: Missing board and unparseable body
- **WHEN** a rename for a board that does not exist has an unparseable body
- **THEN** the response is 400 `MALFORMED_REQUEST`

#### Scenario: Invalid file and used key
- **WHEN** an import file has an over-limit title and a used key
- **THEN** the response is 422 `INVALID_EXPORT_FILE`

#### Scenario: Expired token and invalid body
- **WHEN** a request with an expired access token has an invalid body
- **THEN** the response is 401 `UNAUTHENTICATED`

#### Scenario: Missing board and invalid name
- **WHEN** a rename request for a board that does not exist has an empty name
- **THEN** the response is 404 `NOT_FOUND`

#### Scenario: Invalid name and used key
- **WHEN** a board is created with an over-limit name and a used key
- **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `name`

### Requirement: Rate limit is checked before credentials
On a rate-limited endpoint, a request over the limit SHALL get 429 `RATE_LIMITED` without its credentials or refresh token being evaluated.

#### Scenario: Correct password over the limit
- **WHEN** a client over the login limit sends the correct password
- **THEN** the response is 429 `RATE_LIMITED`, not a successful login
