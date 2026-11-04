# Backend common utilities

| | |
|---|---|
| ID | `be-common` |
| Area | Backend |
| Size | M |
| Wave | 2 |
| Depends on | `be-scaffolding` (service skeleton, migrations, test setup), `api-contract` (`domain-user`, `text-length` and the shared error categories) |
| Unlocks | `be-auth`, `be-boards`, `be-labels`, `mob-api-client`, `web-api-client` |

## Goal
Cross-cutting backend foundation: security filter chain with JWT verification and current-user principal, users table, global error handling per the shared error model, request validation, SpringDoc with an exported OpenAPI spec, and test helpers for authenticated requests.

## In scope
- Security filter chain: JWT access-token verification, public vs. protected routes
- Current-user principal available to every controller
- Users table per `domain-user` (identity, email, password hash, timestamps)
- Global error handling producing the shared error model
- Request validation incl. `text-length` counting and field limits
- SpringDoc setup and an exported OpenAPI spec file the clients generate from
- Test helpers: authenticated requests as a given user, user fixtures
- A sample protected endpoint to prove the pipeline

## Out of scope
- Issuing tokens, register/login/refresh/logout (`be-auth`)
- Any domain feature endpoints

## Builds on
- `be-scaffolding`: service skeleton, migrations, test setup
- `api-contract`: user rules, text limits, error categories

## Provides
- Everything `be-auth`, `be-boards` and `be-labels` need to run in parallel
- The OpenAPI export pipeline both `*-api-client` chunks consume

## Done when
- Sample protected endpoint rejects missing, invalid and expired tokens
- Errors match the shared error model
- Exported OpenAPI spec contains the sample endpoint and error schema
- Tests can call protected endpoints as a given user

## Decisions from the breakdown
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Owns the users table and JWT verification so auth, boards and labels can be built in parallel (user decision).

## Open questions for the deep-dive session
- JWT signing (HS256 secret vs. RS256 key pair) — verification here, issuing in `be-auth`
- How the OpenAPI spec is exported and handed to clients (committed file, CI artifact, Gradle task)
- Error model shape (RFC 9457 problem details?)
- Migration numbering convention for parallel chunks
