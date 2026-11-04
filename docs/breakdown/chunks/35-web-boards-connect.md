# Web boards connect

| | |
|---|---|
| ID | `web-boards-connect` |
| Area | Web |
| Size | M |
| Wave | 5 |
| Depends on | `web-auth-connect` (authenticated pipeline), `web-board-list-ui` (board list and repository interface), `web-board-view-ui` (board view and repository interface), `be-boards` (board/column endpoints) |
| Unlocks | `web-cards-connect`, `web-import-export-connect` |

## Goal
Real boards/columns data sources and mapping; board list and board view wired to the backend and to each other in navigation.

## In scope
- Real boards and columns repositories with DTO mapping
- Board list and board view wired into navigation
- Error handling for real failures (not found, conflicts, network)

## Out of scope
- Cards and labels data (`web-cards-connect`, `web-labels-connect`)

## Builds on
- `web-auth-connect`: authenticated pipeline
- `web-board-list-ui`, `web-board-view-ui`: screens and interfaces
- `be-boards`: endpoints

## Provides
- Real board navigation that cards-connect and import-export-connect build on

## Done when
- Board and column flows work against the local backend

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Reload strategy after mutations (refetch board vs. apply locally)
