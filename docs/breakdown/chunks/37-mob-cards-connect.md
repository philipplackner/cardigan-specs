# Mobile cards connect

| | |
|---|---|
| ID | `mob-cards-connect` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 6 |
| Depends on | `mob-boards-connect` (real board view), `mob-labels-connect` (real labels for the picker), `mob-card-detail-ui` (card editor), `mob-card-dnd` (drag & drop interaction), `be-cards` (card, move and label-attach endpoints) |
| Unlocks | `infra-vps` |

## Goal
Real cards data source; card detail hosted in the board view, drag & drop moves persisted, labels attached via the picker.

## In scope
- Real cards repository with DTO mapping
- Card detail hosted in the board view (adaptive)
- Drag & drop moves persisted, rollback on server errors
- Label picker attached to card detail and persisted

## Out of scope
- Import/export (`mob-import-export-connect`)

## Builds on
- `mob-boards-connect`, `mob-labels-connect`
- `mob-card-detail-ui`, `mob-card-dnd`
- `be-cards`

## Provides
- Feature-complete board experience

## Done when
- Card CRUD, drag & drop moves and label attach work against the local backend

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Optimistic vs. confirmed moves
- Refresh after a failed move
