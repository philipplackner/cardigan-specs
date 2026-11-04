# Web card detail UI

| | |
|---|---|
| ID | `web-card-detail-ui` |
| Area | Web |
| Size | M |
| Wave | 3 |
| Depends on | `web-design-system` (sheets, dialogs, side panels, text fields) |
| Unlocks | `web-cards-connect` |

## Goal
Card create, view, edit and delete with adaptive presentation (sheet on narrow screens, dialog/side panel on wide ones) and the cards repository interface.

## In scope
- Create, view, edit, delete a card
- Adaptive presentation (sheet on narrow screens, dialog/side panel on wide ones)
- Slot for the label picker
- Cards repository interface

## Out of scope
- Hosting inside the board view and persisting (`web-cards-connect`)
- Label picker itself (`web-labels-ui`)

## Builds on
- `web-design-system`: sheets, dialogs, text fields
- Core domain models and text limits from scaffolding

## Provides
- Card editing surface and repository interface cards-connect implements

## Done when
- Card detail shows every state from phone to desktop widths
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Built standalone in its feature module; it's hosted in the board view only in cards-connect.

## Open questions for the deep-dive session
- Quick-add vs. full editor for new cards
- Unsaved-changes handling
- Plain text vs. markdown description
