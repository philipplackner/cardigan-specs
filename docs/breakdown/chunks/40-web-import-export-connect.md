# Web import/export connect

| | |
|---|---|
| ID | `web-import-export-connect` |
| Area | Web |
| Size | S |
| Wave | 6 |
| Depends on | `web-boards-connect` (real board list to host actions), `web-import-export-ui` (file handling and UI), `be-import-export` (import/export endpoints) |
| Unlocks | `infra-vps` |

## Goal
Real import/export calls wired to the file handling, hosted in the board list.

## In scope
- Real import/export calls wired to the file handling
- Actions hosted in the board list
- Navigation to the imported board

## Out of scope
- Async import jobs (not wanted)

## Builds on
- `web-boards-connect`
- `web-import-export-ui`
- `be-import-export`

## Provides
- Import/export on web

## Done when
- Exporting a board and importing the file works against the local backend

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Timeout and size handling on slow networks
