# Mobile auth connect

| | |
|---|---|
| ID | `mob-auth-connect` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 4 |
| Depends on | `mob-auth-ui` (screens and auth repository interface), `mob-api-client` (generated client and HTTP pipeline), `be-auth` (auth endpoints in the OpenAPI spec) |
| Unlocks | `mob-boards-connect`, `mob-labels-connect` |

## Goal
Real auth data source on the generated client, secure token storage, authenticated HTTP pipeline with refresh-on-expiry, logout, and session-gated navigation.

## In scope
- Real auth repository on the generated client
- Secure token storage (Keystore/Keychain)
- Authenticated HTTP pipeline: attach access token, single-flight refresh on expiry, forced logout on failed refresh
- Logout
- Session-gated navigation

## Out of scope
- Feature data sources (other connect chunks)

## Builds on
- `mob-auth-ui`: screens and repository interface
- `mob-api-client`: generated client
- `be-auth`: auth endpoints

## Provides
- Authenticated session and HTTP pipeline every other connect chunk needs

## Done when
- Register, login, auto-refresh and logout work against the local backend on Android and iOS

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.

## Open questions for the deep-dive session
- Secure storage library
- Refresh concurrency details
