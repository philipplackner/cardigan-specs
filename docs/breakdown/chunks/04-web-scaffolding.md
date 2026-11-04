# Web scaffolding & architecture

| | |
|---|---|
| ID | `web-scaffolding` |
| Area | Web |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `web-api-client`, `web-design-system` |

## Goal
React + TypeScript project, build tooling, isolated feature folder structure, routing, data-fetching setup, app-wide utilities (result/error types, logging), core domain models (Board, Column, Card, Label, User, text-length counting and field limits), responsive app shell, lint/test and CI.

## In scope
- React + TypeScript project and build tooling
- Isolated feature folder structure and conventions
- Routing
- Server-state/data-fetching setup
- App-wide utilities: result/error types, logging
- Core domain models: Board, Column, Card, Label, User per the shared domain specs, `text-length` counting and field limits
- Responsive app shell
- Lint, format, unit tests, CI producing a static build

## Out of scope
- Design system (`web-design-system`)
- HTTP client and backend error mapping (`web-api-client`)

## Builds on
- Nothing (root chunk)
- Shared specs already merged in this repo: domain specs and `text-length`

## Provides
- Project skeleton, shared domain models, and the static build artifact `infra-vps` deploys

## Done when
- App builds and runs with routing and a responsive shell
- Domain models and text-length counting have unit tests
- CI lints, tests and produces a static build

## Decisions from the breakdown
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Client-wide utilities and core domain models live here, not in a separate chunk (user decision).

## Open questions for the deep-dive session
- Build tool (Vite?)
- Data fetching (TanStack Query?) without persistent cache
- Styling approach
