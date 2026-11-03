# Web labels

| | |
|---|---|
| ID | `web-labels` |
| Area | Web |
| Size | M |
| Wave | 5 |
| Depends on | `web-card-detail` (card editor to attach labels in) |
| Unlocks | `web-search-filter` |

## Goal
Label management (create/edit/delete), attaching labels to cards, and showing labels on cards.

## In scope
- Label management (create, edit, delete)
- Attach/detach labels in card detail
- Labels on card tiles

## Out of scope
- Filtering (`web-search-filter`)

## Builds on
- `web-card-detail`: card editor to attach labels in

## Provides
- Label UI used by search & filter

## Done when
- Labels can be managed and attached to cards against the fake API

## Decisions from the breakdown
- Labels are user-defined (user decision).

## Open questions for the deep-dive session
- Where label management lives (settings page vs. board menu)
- Color choice UX
- Inline creation while attaching
