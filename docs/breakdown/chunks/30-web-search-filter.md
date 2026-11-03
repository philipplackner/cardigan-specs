# Web board search & filter

| | |
|---|---|
| ID | `web-search-filter` |
| Area | Web |
| Size | S |
| Wave | 6 |
| Depends on | `web-labels` (labels to filter by) |
| Unlocks | `web-integration` |

## Goal
Client-side text search and label filter over the cards of the open board.

## In scope
- Text search over cards of the open board
- Filter by labels
- Reset filters, empty state

## Out of scope
- Cross-board search, backend search

## Builds on
- `web-labels`: labels to filter by

## Provides
- Board filtering on web

## Done when
- Search and label filters narrow visible cards of the open board without backend calls, on all breakpoints

## Decisions from the breakdown
- Client-side only, within the open board (user decision).

## Open questions for the deep-dive session
- Searched fields
- AND vs. OR for labels
- Filter state in URL?
- Drag & drop while filtered
