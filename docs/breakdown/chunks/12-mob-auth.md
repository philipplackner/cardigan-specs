# Mobile authentication

| | |
|---|---|
| ID | `mob-auth` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-fake-api` (auth data source), `mob-design-system` (form components) |
| Unlocks | `mob-integration` |

## Goal
Register, login and logout screens, secure token storage on Android and iOS, refresh-on-expiry handling, and session-gated navigation.

## In scope
- Register, login and logout screens and flows
- Secure token storage on Android and iOS
- Automatic refresh on expired access token, forced logout on failed refresh
- Session-gated navigation (logged out → auth flow)

## Out of scope
- Forgot password, email verification (out of v1)

## Builds on
- `mob-fake-api`: auth data source
- `mob-design-system`: form components

## Provides
- Session state and authenticated HTTP pipeline used in integration

## Done when
- Register, login, auto-refresh and logout work against the fake API on Android and iOS, incl. error states

## Decisions from the breakdown
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Built in parallel with board features; boards use a fake session until integration.

## Open questions for the deep-dive session
- Secure storage approach per platform (Keystore/Keychain wrapper library?)
- Refresh concurrency (single-flight refresh)
- Form validation rules (mirror backend)
