# Web integration with real backend

| | |
|---|---|
| ID | `web-integration` |
| Area | Web |
| Size | M |
| Wave | 7 |
| Depends on | `web-auth` (session handling), `web-card-dnd` (move flows), `web-search-filter` (complete board UI), `web-import-export` (file flows), `be-import-export` (the complete backend), `infra-vps` (production deployment on the same domain) |
| Unlocks | none |

## Goal
Switch from fakes to the real API, environment config, real refresh-token flow (incl. CORS/cookie decisions), and end-to-end verification against production.

## In scope
- Switch from fake to real API
- Real refresh-token flow incl. cookie/CORS settings
- Environment configuration
- End-to-end verification against production
- Fix contract mismatches

## Out of scope
- Mobile integration (`mob-integration`)

## Builds on
- `web-auth`: session handling
- `web-card-dnd`: move flows
- `web-search-filter`: complete board UI
- `web-import-export`: file flows
- `be-import-export`: the complete backend
- `infra-vps`: production deployment on the same domain

## Provides
- Web app working against the real backend in production

## Done when
- All v1 flows work against the deployed backend in production

## Decisions from the breakdown
- Client feature chunks run against the fake API layer; the real backend is only wired in the client's integration chunk.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Served from the same VPS/domain as the API (user decision).

## Open questions for the deep-dive session
- E2E test suite (Playwright?) against a local backend
- Keep fake mode for development?
