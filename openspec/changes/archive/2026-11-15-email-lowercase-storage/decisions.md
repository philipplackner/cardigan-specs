# Decisions: email-lowercase-storage

Confirmed with Philipp Lackner on 2026-11-15.

## Summary

User emails are lowercased after normalization and stored that way, so uniqueness is a plain equality check and every response returns the lowercased email. Submitted emails are lowercased before lookup, so login works in any letter case. Only the backend lowercases; clients send what the user typed. Nothing is implemented yet, so the change is not breaking.

## Decisions

### D1 — Stored email case
- **Question**: Are emails stored as entered or lowercased?
- **Decision**: Lowercased after normalization, unique by plain equality. Login and `GET /users/me` return the lowercased email.
- **Alternatives**: Keep as entered, unique after case folding (the previous rule).
- **Why**: Decided in the backend session for `backend-common-utilities`; a plain unique constraint is simpler than a case-folded one.
- **Depends on**: —

### D2 — Lookup of submitted emails
- **Question**: How is an email submitted at registration or login matched?
- **Decision**: It is lowercased before lookup, so any letter case matches the stored email.
- **Alternatives**: —
- **Depends on**: D1

### D3 — Breaking change
- **Question**: Is this change breaking?
- **Decision**: No. No platform stores users yet.
- **Alternatives**: Mark as breaking.
- **Depends on**: D1

### D4 — Where lowercasing happens
- **Question**: Do clients lowercase emails before sending?
- **Decision**: No. Only the backend lowercases. Clients send what the user typed and show the email the backend returns.
- **Alternatives**: Clients also lowercase.
- **Depends on**: D1

## Facts

- Emails are ASCII-only after normalization, so lowercasing ASCII `A`–`Z` equals Unicode default case folding for any valid email — source: `domain-user`, "Email follows the RFC 5322 address format".
- The login rate limit already compares emails after case folding — source: `api-auth-tokens`.

## Out of scope

- Password rules, the email format rule and the login rate limit.

## Deferred

- None.
