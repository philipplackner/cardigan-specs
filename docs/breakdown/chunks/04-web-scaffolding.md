# Web scaffolding & architecture

| | |
|---|---|
| ID | `web-scaffolding` |
| Area | Web |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `infra-vps`, `web-design-system`, `web-fake-api` |

## Goal
React + TypeScript project, build tooling, routing, data-fetching setup, HTTP client base and error model, responsive app shell, lint/test and CI.

## In scope
- React + TypeScript project and build tooling
- Folder/module structure and conventions
- Routing
- Server-state/data-fetching setup
- HTTP client base and error model
- Responsive app shell
- Lint, format, unit tests, CI producing a static build

## Out of scope
- Design system (`web-design-system`)
- Fake API (`web-fake-api`)

## Builds on
- Nothing (root chunk; greenfield repo)

## Provides
- Project skeleton and static build artifact that infrastructure deploys

## Done when
- App builds and runs with routing and a responsive shell
- CI lints, tests and produces a static build

## Decisions from the breakdown
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Build tool (Vite?)
- Data fetching (TanStack Query?) — no persistent cache
- State management needs
- Styling approach (CSS modules, Tailwind, …)
- Generated API types from the contract?
