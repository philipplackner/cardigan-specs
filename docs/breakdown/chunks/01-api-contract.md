# API contract

| | |
|---|---|
| ID | `api-contract` |
| Area | API Contract |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `be-auth`, `mob-fake-api`, `web-fake-api` |

## Goal
REST contract (e.g. OpenAPI) for auth, boards, columns, cards, labels, ordering and board import/export, including the shared error model and the JSON export format.

## In scope
- REST resources and operations for auth (register, login, refresh, logout), boards, columns, cards, labels, card/column ordering and board import/export
- Shared error model (validation errors, auth errors, not found, conflicts)
- Versioned JSON export format for a complete board
- Auth conventions: how access and refresh tokens are sent and returned

## Out of scope
- Implementing the contract on any platform (backend chunks, fake API layers)

## Builds on
- Nothing (root chunk; greenfield repo)

## Provides
- The spec all backend chunks implement and both fake API layers mirror
- The export file format used by import/export chunks

## Done when
- Spec passes a linter/validator
- Every v1 operation incl. error responses is described
- Reviewed against the v1 scope in OVERVIEW.md

## Decisions from the breakdown
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Boards and labels are private per user; no sharing or members in v1.
- Search & filter is client-side only, so the contract has no search endpoint.
- Import/export are one blocking request each (upload / download), no async jobs.

## Open questions for the deep-dive session
- Spec format and tooling (OpenAPI 3.x? code generation for clients/backend or hand-written?)
- Ordering representation for columns and cards (integer positions, fractional ranks, or explicit move operations with target index)
- Card fields beyond title, description and labels (e.g. due date, priority)?
- Do board reads return the full board (columns + cards + labels) in one call?
- Refresh token transport for web (httpOnly cookie vs. body) vs. mobile
- Export format versioning and how imported label conflicts are handled (reuse by name vs. always create)
- Pagination needs (probably none for v1)
