# Spec Delta

## MODIFIED Requirements

### Requirement: Error precedence
When a request breaks several rules, the backend SHALL report only the first applying rule in this order: access token (401 `UNAUTHENTICATED`); size (413); media type (415); parsing (400 `MALFORMED_REQUEST`); rate limit (429); route and references (404); field validation (400 `VALIDATION_FAILED`, or 422 `INVALID_EXPORT_FILE` for import file content); credentials and refresh tokens (401 `INVALID_CREDENTIALS`, 401 `INVALID_REFRESH_TOKEN`); uniqueness (409).

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

#### Scenario: Unparseable login over the limit
- **WHEN** a client over the login limit for an email sends a login request whose body is not valid JSON
- **THEN** the response is 400 `MALFORMED_REQUEST`

#### Scenario: Invalid register over the limit
- **WHEN** a client over the register limit for an email sends a register request with a weak password
- **THEN** the response is 429 `RATE_LIMITED`
