# Web authentication

| | |
|---|---|
| ID | `web-auth` |
| Area | Web |
| Size | M |
| Wave | 3 |
| Depends on | `web-fake-api` (auth operations), `web-design-system` (form components) |
| Unlocks | `web-integration` |

## Goal
Register, login and logout pages, token handling and refresh-on-expiry, protected routes.

## In scope
- Register, login, logout pages
- Token handling and refresh on expiry, logout on failed refresh
- Protected routes and redirects

## Out of scope
- Forgot password, email verification (out of v1)

## Builds on
- `web-fake-api`: auth operations
- `web-design-system`: form components

## Provides
- Session handling and authenticated requests used in integration

## Done when
- Register, login, auto-refresh and logout work against the fake API, incl. error states

## Decisions from the breakdown
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.

## Open questions for the deep-dive session
- Where the access token lives (memory) and refresh token transport (httpOnly cookie?)
- Single-flight refresh
- Validation rules
