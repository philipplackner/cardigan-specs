# Mobile import/export connect

| | |
|---|---|
| ID | `mob-import-export-connect` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 6 |
| Depends on | `mob-boards-connect` (real board list and board view to host actions), `mob-import-export-ui` (file handling and UI), `be-import-export` (import/export endpoints) |
| Unlocks | `infra-vps` |

## Goal
Real import/export calls wired to the file handling; export in the board view's ⋯ menu, import in the board list.

## In scope
- Real import/export calls wired to the file handling
- Export action hosted in the board view's ⋯ menu
- Import action hosted in the board list; after success the list reloads and shows the import toast

## Out of scope
- Async import jobs (not wanted)

## Builds on
- `mob-boards-connect`
- `mob-import-export-ui`
- `be-import-export`

## Provides
- Import/export on mobile

## Done when
- Exporting a board and importing the file works against the local backend

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Export lives only in the board view's ⋯ menu, not in the board list (user decision).
- After a successful import, the user stays on the board list, which reloads, and sees the toast "Imported “X” with the key <KEY>." There is no navigation to the imported board (user decision).

## Open questions for the deep-dive session
- Timeout and size handling on slow networks
