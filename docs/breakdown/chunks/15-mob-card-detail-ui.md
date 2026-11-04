# Mobile card detail UI

| | |
|---|---|
| ID | `mob-card-detail-ui` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-design-system` (sheets, dialogs, side panels, text fields) |
| Unlocks | `mob-cards-connect` |

## Goal
Card create, view, edit and delete with adaptive presentation (sheet on narrow screens, dialog/side panel on wide ones) and the cards repository interface.

## In scope
- Create, view, edit, delete a card
- Adaptive presentation (sheet on narrow screens, dialog/side panel on wide ones)
- Slot for the label picker
- Cards repository interface

## Out of scope
- Hosting inside the board view and persisting (`mob-cards-connect`)
- Label picker itself (`mob-labels-ui`)

## Builds on
- `mob-design-system`: sheets, dialogs, text fields
- Core domain models and text limits from scaffolding

## Provides
- Card editing surface and repository interface cards-connect implements

## Done when
- Card detail shows every state on Android and iOS, phone and tablet
- ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Built standalone in its feature module; it's hosted in the board view only in cards-connect.

## Open questions for the deep-dive session
- Quick-add vs. full editor for new cards
- Unsaved-changes handling
- Plain text vs. markdown description
