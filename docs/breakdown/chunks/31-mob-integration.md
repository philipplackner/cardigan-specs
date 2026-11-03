# Mobile integration with real backend

| | |
|---|---|
| ID | `mob-integration` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 7 |
| Depends on | `mob-auth` (session and token handling), `mob-card-dnd` (move flows), `mob-search-filter` (complete board UI), `mob-import-export` (file flows), `be-import-export` (the complete backend (auth, boards, cards, labels, import/export)), `infra-vps` (deployed production URL) |
| Unlocks | none |

## Goal
Real HTTP implementations of the data sources, environment/base URL config, real refresh-token flow, and end-to-end verification against production.

## In scope
- Real HTTP data source implementations replacing the fakes
- Authenticated HTTP pipeline with real refresh-token flow
- Environment / base URL configuration
- End-to-end verification of all flows against production
- Fixing contract mismatches found during integration

## Out of scope
- Store release (out of plan)

## Builds on
- `mob-auth`: session and token handling
- `mob-card-dnd`: move flows
- `mob-search-filter`: complete board UI
- `mob-import-export`: file flows
- `be-import-export`: the complete backend (auth, boards, cards, labels, import/export)
- `infra-vps`: deployed production URL

## Provides
- Mobile app working against the real backend

## Done when
- All v1 flows work on Android and iOS against the deployed backend

## Decisions from the breakdown
- Client feature chunks run against the fake API layer; the real backend is only wired in the client's integration chunk.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Keep fakes for tests/debug builds?
- Build variants for local vs. production backend
- Handling of network errors/timeouts in real conditions
