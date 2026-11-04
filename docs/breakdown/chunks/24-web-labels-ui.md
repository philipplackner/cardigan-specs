# Web labels UI

| | |
|---|---|
| ID | `web-labels-ui` |
| Area | Web |
| Size | M |
| Wave | 3 |
| Depends on | `web-design-system` (chips, dialogs, lists) |
| Unlocks | `web-labels-connect`, `web-search-filter` |

## Goal
Label management (create, edit, delete with palette colors) and a reusable label picker for cards, plus the labels repository interface.

## In scope
- Label management screen (create, edit, delete, palette colors)
- Reusable label picker for cards
- Labels repository interface

## Out of scope
- Filtering by label (`web-search-filter`)
- Persisting label attachments (`web-cards-connect`)

## Builds on
- `web-design-system`: chips, dialogs, lists
- Label model and palette from scaffolding

## Provides
- Label management, label picker, repository interface used by search & filter, labels-connect and cards-connect

## Done when
- Label management and picker show every state from phone to desktop widths
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Where label management lives in navigation
- Create a label inline from the picker?
