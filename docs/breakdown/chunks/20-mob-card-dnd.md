# Mobile card drag & drop

| | |
|---|---|
| ID | `mob-card-dnd` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 4 |
| Depends on | `mob-board-view` (column and card layout to drag within) |
| Unlocks | `mob-integration` |

## Goal
Touch drag & drop of cards within and across columns, including auto-scroll, persisting the move and handling failures.

## In scope
- Long-press drag of cards within a column and across columns
- Auto-scroll while dragging (vertical and between columns)
- Drop placement indicator
- Persisting the move and rolling back on failure
- Works in phone and tablet layouts

## Out of scope
- Column drag & drop (columns use move buttons)

## Builds on
- `mob-board-view`: column and card layout to drag within

## Provides
- Card reordering on mobile

## Done when
- Cards can be dragged within and across columns on Android and iOS, phone and tablet
- Order persists in the fake API; failed moves roll back with a message

## Decisions from the breakdown
- Cards are reordered by drag & drop (user decision).

## Open questions for the deep-dive session
- Library vs. custom drag & drop in Compose Multiplatform
- Cross-column dragging on phone layout (edge-swipe to next column?)
- Accessibility alternative to dragging (move menu?)
