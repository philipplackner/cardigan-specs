# Mobile card drag & drop

| | |
|---|---|
| ID | `mob-card-dnd` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 4 |
| Depends on | `mob-board-view-ui` (column and card layout to drag within) |
| Unlocks | `mob-cards-connect` |

## Goal
Drag & drop of cards within and across columns with auto-scroll and drop indicators, emitting moves through the cards repository interface with rollback on failure.

## In scope
- Drag of cards within and across columns (long-press touch)
- Auto-scroll and drop indicators
- Emitting moves through the cards repository interface, rollback on failure
- Works in all layouts

## Out of scope
- Column drag & drop (columns use move buttons)
- Persisting moves against the backend (`mob-cards-connect`)

## Builds on
- `mob-board-view-ui`: board layout

## Provides
- Card reordering interaction that cards-connect persists

## Done when
- Cards can be dragged within and across columns on Android and iOS, phone and tablet
- Failed moves roll back in tests

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Cards are reordered by drag & drop (user decision).

## Open questions for the deep-dive session
- Library vs. custom drag & drop in CMP
- Cross-column dragging on phones
- Accessibility alternative (move menu?)
