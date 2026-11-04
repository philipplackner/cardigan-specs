# Mobile auth UI

| | |
|---|---|
| ID | `mob-auth-ui` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 3 |
| Depends on | `mob-design-system` (form components) |
| Unlocks | `mob-auth-connect` |

## Goal
Register and login screens with ViewModels, form validation per the shared specs, and the auth repository interface; tested with test doubles.

## In scope
- Register and login screens
- ViewModels with form validation per `domain-user`
- Auth repository interface
- Logout action placement

## Out of scope
- Token storage, refresh, session gating (`mob-auth-connect`)
- Forgot password, email verification (out of v1)

## Builds on
- `mob-design-system`: form components
- Core domain models and validation from scaffolding

## Provides
- Auth screens and repository interface that auth-connect implements

## Done when
- Register and login show every state on Android and iOS, phone and tablet
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.

## Open questions for the deep-dive session
- Inline vs. on-submit validation
