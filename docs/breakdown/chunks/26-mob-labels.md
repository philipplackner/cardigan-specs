# Mobile labels

| | |
|---|---|
| ID | `mob-labels` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 5 |
| Depends on | `mob-card-detail` (card editor to attach labels in) |
| Unlocks | `mob-search-filter` |

## Goal
Label management (create/edit/delete), attaching labels to cards, and showing labels on cards.

## In scope
- Label management screen (create, edit, delete)
- Attach/detach labels in card detail
- Show labels on card tiles in the board view

## Out of scope
- Filtering by label (`mob-search-filter`)

## Builds on
- `mob-card-detail`: card editor to attach labels in

## Provides
- Label UI and state used by search & filter

## Done when
- Labels can be managed and attached to cards against the fake API on both platforms

## Decisions from the breakdown
- Labels are user-defined (user decision).

## Open questions for the deep-dive session
- Where label management lives in navigation
- Color picker vs. fixed palette
- Create a label inline while attaching?
