# Backend authentication

| | |
|---|---|
| ID | `be-auth` |
| Area | Backend |
| Size | M |
| Wave | 3 |
| Depends on | `be-common` (users table, JWT verification, error model, test helpers) |
| Unlocks | `mob-auth-connect`, `web-auth-connect` |

## Goal
Registration, login, refresh and logout: password hashing, issuing 15-minute JWT access tokens, 30-day refresh tokens with rotation and revocation.

## In scope
- Registration with password hashing and validation per `domain-user`
- Login issuing access + refresh tokens
- Refresh with token rotation
- Logout revoking the refresh token
- Persisted (hashed) refresh tokens with expiry and revocation

## Out of scope
- Email verification, forgot password, social login (out of v1)
- Token verification on protected routes (`be-common`)

## Builds on
- `be-common`: users table, security filter chain, error model, SpringDoc

## Provides
- Auth endpoints in the OpenAPI spec that `mob-auth-connect` and `web-auth-connect` generate from

## Done when
- Integration tests cover register, login, refresh, logout, duplicate email, wrong password, expired and revoked refresh tokens
- Endpoints and errors appear in the exported OpenAPI spec

## Decisions from the breakdown
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Shared domain rules (ids, ownership, keys, card numbering, palette, dense positions, last write wins, cascading deletes, text limits) are settled in the shared specs; implement them, don't redecide them.

## Open questions for the deep-dive session
- bcrypt vs. argon2 and parameters
- Refresh token reuse detection (revoke the token family?)
- Logout from one device vs. all devices
- Login rate limiting
- Cleanup of expired refresh tokens
