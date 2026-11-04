# Web board search & filter

| | |
|---|---|
| ID | `web-search-filter` |
| Area | Web |
| Size | S |
| Wave | 4 |
| Depends on | `web-board-view-ui` (cards of the open board), `web-labels-ui` (labels repository interface and chips) |
| Unlocks | `infra-vps` |

## Goal
Client-side text search and label filter over the cards of the open board.

## In scope
- Text search over the cards of the open board
- Filter by one or more labels
- Reset and empty-result state

## Out of scope
- Search across boards (out of v1)
- Any backend search endpoint

## Builds on
- `web-board-view-ui`: board data and layout
- `web-labels-ui`: labels repository interface and chips

## Provides
- Board filtering; works on real data automatically once boards-connect lands

## Done when
- Search and label filters narrow the visible cards without backend calls, verified in tests

## Decisions from the breakdown
- Search & filter is client-side and only within the open board (user decision).
- Needs no connect chunk of its own.

## Open questions for the deep-dive session
- Which card fields are searched
- AND vs. OR for multiple labels
- Drag & drop while filtered?
