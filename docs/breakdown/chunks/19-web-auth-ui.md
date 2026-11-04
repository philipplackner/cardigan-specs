# Web auth UI

| | |
|---|---|
| ID | `web-auth-ui` |
| Area | Web |
| Size | S |
| Wave | 3 |
| Depends on | `web-design-system` (form components) |
| Unlocks | `web-auth-connect` |

## Goal
Register and login screens with ViewModels, form validation per the shared specs, and the auth repository interface; tested with test doubles.

## In scope
- Register and login screens
- ViewModels with form validation per `domain-user`
- Auth repository interface
- Logout action placement

## Out of scope
- Token storage, refresh, session gating (`web-auth-connect`)
- Forgot password, email verification (out of v1)

## Builds on
- `web-design-system`: form components
- Core domain models and validation from scaffolding

## Provides
- Auth screens and repository interface that auth-connect implements

## Done when
- Register and login show every state from phone to desktop widths
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.

## Open questions for the deep-dive session
- Inline vs. on-submit validation
