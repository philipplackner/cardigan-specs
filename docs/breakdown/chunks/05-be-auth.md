# Backend authentication

| | |
|---|---|
| ID | `be-auth` |
| Area | Backend |
| Size | M |
| Wave | 2 |
| Depends on | `be-scaffolding` (service skeleton, migrations, error handling), `api-contract` (auth operations and token conventions) |
| Unlocks | `be-boards` |

## Goal
Users, registration, login and logout with password hashing, 15-minute JWT access tokens, 30-day refresh tokens with rotation and revocation, and the security filter protecting all other endpoints.

## In scope
- Users table and registration with password hashing and input validation
- Login issuing access + refresh tokens
- Refresh with token rotation
- Logout revoking the refresh token
- Persisted refresh tokens (hashed) with expiry and revocation
- Security filter chain protecting all non-auth endpoints and exposing the current user

## Out of scope
- Email verification, forgot password, social login (out of v1)
- Board/card endpoints (`be-boards`, `be-cards`)

## Builds on
- `be-scaffolding`: service skeleton, migrations, error handling
- `api-contract`: auth operations and token conventions

## Provides
- Authenticated current-user principal for every domain endpoint
- Users table that boards reference

## Done when
- Integration tests cover register, login, refresh, logout, duplicate email, wrong password, expired and revoked tokens
- Behavior matches the contract

## Decisions from the breakdown
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Implemented manually on the backend, not via Supabase Auth.

## Open questions for the deep-dive session
- Password hashing algorithm and parameters (bcrypt vs. argon2)
- JWT signing (HS256 secret vs. RS256 key pair) and key rotation
- Refresh token reuse detection (revoke the whole token family?)
- Logout from one device vs. all devices
- Rate limiting / brute-force protection on login
- Password rules
- Cleanup of expired refresh tokens
