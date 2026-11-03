# Web fake API layer

| | |
|---|---|
| ID | `web-fake-api` |
| Area | Web |
| Size | M |
| Wave | 2 |
| Depends on | `api-contract` (operations to fake), `web-scaffolding` (HTTP client and error model) |
| Unlocks | `web-auth`, `web-board-list`, `web-board-view` |

## Goal
Fake implementation of the contract (in-memory or request mocking) modeling production behavior including errors, latency and token expiry, switchable for the real API.

## In scope
- Fake implementation of every contract operation incl. ordering and import/export
- Realistic latency, validation/auth errors, token expiry
- Seed data
- Toggle between fake and real API via config

## Out of scope
- Real API wiring (`web-integration`)

## Builds on
- `api-contract`: operations to fake
- `web-scaffolding`: HTTP client and error model

## Provides
- The API all web feature chunks build against

## Done when
- Every contract operation is served by the fake layer with tests, toggled by configuration

## Decisions from the breakdown
- Client feature chunks run against the fake API layer; the real backend is only wired in the client's integration chunk.

## Open questions for the deep-dive session
- Request mocking (MSW) vs. in-memory client implementation
- How to trigger error scenarios
- Reuse fake for component/E2E tests
