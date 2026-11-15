# Spec Delta

## REMOVED Requirements

### Requirement: Email identifies exactly one user
**Reason**: Emails are now stored lowercased instead of as entered.
**Migration**: Replaced by "Email is stored lowercased and identifies one user". No platform stores users yet, so no data has to change.

## ADDED Requirements

### Requirement: Email is stored lowercased and identifies one user
Each user SHALL have exactly one email of 1 to 254 characters, single-line, normalized and counted as defined in `text-length`. After normalization, the backend SHALL convert the email to lowercase and store and return only the lowercased form. No two users SHALL have the same stored email. An email submitted to log in SHALL be lowercased the same way before it is matched. Clients SHALL send the email as entered and SHALL NOT need to lowercase it.

#### Scenario: Same email in different case
- **WHEN** a user with the email `Ann@example.com` exists and another account is created with `ann@EXAMPLE.com`
- **THEN** the second account is rejected because the email is already used

#### Scenario: Email is stored lowercased
- **WHEN** a user registers with `  Ann@Example.com `
- **THEN** the stored email is `ann@example.com`, and the backend returns `ann@example.com` wherever it returns the user's email

#### Scenario: Login in a different case
- **WHEN** a user registered with `Ann@Example.com` logs in with `ANN@example.COM` and the correct password
- **THEN** the login succeeds

#### Scenario: Email over the limit
- **WHEN** an email has a normalized length of 255
- **THEN** it is rejected with a validation error for the email
