# Mobile board search & filter

| | |
|---|---|
| ID | `mob-search-filter` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 6 |
| Depends on | `mob-labels` (labels on cards to filter by) |
| Unlocks | `mob-integration` |

## Goal
Client-side text search and label filter over the cards of the open board.

## In scope
- Text search over cards of the open board
- Filter by one or more labels
- Clear/reset filters; empty result state

## Out of scope
- Search across boards (out of v1)
- Any backend search endpoint (client-side only)

## Builds on
- `mob-labels`: labels on cards to filter by

## Provides
- Board filtering on mobile

## Done when
- Search and label filters narrow the visible cards of the open board without backend calls, on phone and tablet

## Decisions from the breakdown
- Search & filter is purely client-side and only within the open board (user decision).

## Open questions for the deep-dive session
- Which card fields are searched
- AND vs. OR for multiple labels
- Does drag & drop work while filtered?
- Filter state survives refresh?
