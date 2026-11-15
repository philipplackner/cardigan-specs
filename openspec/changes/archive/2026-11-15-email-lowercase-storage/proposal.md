# Proposal

## Breaking Change

No. No platform stores users yet, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

Storing emails as entered and enforcing uniqueness after case folding needs a case-folded unique constraint and gives back mixed-case emails. Storing them lowercased is simpler and gives every platform one canonical form.

## What Changes

- The backend lowercases emails after normalization and stores the lowercased form.
- Uniqueness is plain equality on the stored email.
- Emails submitted at registration and login are lowercased before lookup, so any letter case matches.
- Login and `GET /users/me` return the lowercased email. Clients send what the user typed and show the returned email.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `domain-user`: "Email identifies exactly one user" is replaced by "Email is stored lowercased and identifies one user", which stores the email lowercased instead of as entered.
