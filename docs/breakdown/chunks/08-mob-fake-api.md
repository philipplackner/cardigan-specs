# Mobile fake API layer

| | |
|---|---|
| ID | `mob-fake-api` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 2 |
| Depends on | `api-contract` (operations and models to fake), `mob-scaffolding` (networking/error model and DI) |
| Unlocks | `mob-auth`, `mob-board-list`, `mob-board-view` |

## Goal
Data source interfaces from the contract plus in-memory fakes that model production behavior, including errors, latency and expiring tokens, swappable for the real client later.

## In scope
- Data source/repository interfaces derived from the contract
- In-memory fakes for every operation incl. ordering and import/export
- Realistic behavior: latency, validation and auth errors, expiring access tokens
- Seed data and DI switch between fake and real

## Out of scope
- Real HTTP implementations (`mob-integration`)

## Builds on
- `api-contract`: operations and models to fake
- `mob-scaffolding`: networking/error model and DI

## Provides
- The data layer all mobile feature chunks build against

## Done when
- Every contract operation has a fake with unit tests
- Fake vs. real selectable via DI/config

## Decisions from the breakdown
- Client feature chunks run against the fake API layer; the real backend is only wired in the client's integration chunk.

## Open questions for the deep-dive session
- Fakes at repository level vs. HTTP level (mock engine)
- How error scenarios are triggered (debug menu, seeded users?)
- Seed data set
