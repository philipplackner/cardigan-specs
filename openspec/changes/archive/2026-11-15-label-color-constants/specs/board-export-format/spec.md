# Spec Delta

## MODIFIED Requirements

### Requirement: Import validates every rule of the domain
Every value in the file, except `exportedAt`, `createdAt` and `updatedAt`, SHALL be normalized and validated with the same rules that apply when the data is created through the API. Any violation SHALL reject the file with 422 `INVALID_EXPORT_FILE` and an empty `fieldErrors`, and the response SHALL NOT say what failed. The backend SHALL stop validating at the first violation and SHALL log its JSON path and rule.

#### Scenario: Title too long in the file
- **WHEN** the first card of the second column has a title with a normalized length of 201
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Unknown color
- **WHEN** a file label has the color `MAGENTA`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

#### Scenario: Color in the wrong letter case
- **WHEN** a file label has the color `Teal`
- **THEN** the response is 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`

### Requirement: Labels are reused by name on import
A file label whose case-folded name equals the name of one of the current user's labels SHALL map to that existing label, which keeps its current name and color. Every other file label SHALL be created for the user with the name and color from the file.

#### Scenario: Existing label reused
- **WHEN** the user has the label `bug` colored `BLUE` and the file has `Bug` colored `RED`
- **THEN** imported cards carry the existing `bug` label, which stays `BLUE`, and no new label is created

#### Scenario: New label created
- **WHEN** the file has the label `Docs` with `"color": "TEAL"` and the user has no label with that name
- **THEN** a new label `Docs` with the color `TEAL` is created for the user
